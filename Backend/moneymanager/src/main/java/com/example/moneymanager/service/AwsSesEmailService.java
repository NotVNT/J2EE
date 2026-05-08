package com.example.moneymanager.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.sesv2.model.*;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class AwsSesEmailService {

    private final SesV2Client sesV2Client;

    @Value("${aws.ses.from-email}")
    private String fromEmail;

    /**
     * Gửi email văn bản thuần qua AWS SES.
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            SendEmailRequest request = SendEmailRequest.builder()
                    .fromEmailAddress(fromEmail)
                    .destination(Destination.builder()
                            .toAddresses(to)
                            .build())
                    .content(EmailContent.builder()
                            .simple(Message.builder()
                                    .subject(Content.builder()
                                            .charset(StandardCharsets.UTF_8.name())
                                            .data(subject)
                                            .build())
                                    .body(Body.builder()
                                            .text(Content.builder()
                                                    .charset(StandardCharsets.UTF_8.name())
                                                    .data(body)
                                                    .build())
                                            .build())
                                    .build())
                            .build())
                    .build();

            sesV2Client.sendEmail(request);
            log.info("Email sent via AWS SES to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email via AWS SES to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email via AWS SES: " + e.getMessage(), e);
        }
    }

    /**
     * Gửi email HTML qua AWS SES.
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            SendEmailRequest request = SendEmailRequest.builder()
                    .fromEmailAddress(fromEmail)
                    .destination(Destination.builder()
                            .toAddresses(to)
                            .build())
                    .content(EmailContent.builder()
                            .simple(Message.builder()
                                    .subject(Content.builder()
                                            .charset(StandardCharsets.UTF_8.name())
                                            .data(subject)
                                            .build())
                                    .body(Body.builder()
                                            .html(Content.builder()
                                                    .charset(StandardCharsets.UTF_8.name())
                                                    .data(htmlBody)
                                                    .build())
                                            .build())
                                    .build())
                            .build())
                    .build();

            sesV2Client.sendEmail(request);
            log.info("HTML email sent via AWS SES to {}", to);
        } catch (Exception e) {
            log.error("Failed to send HTML email via AWS SES to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send HTML email via AWS SES: " + e.getMessage(), e);
        }
    }

    /**
     * Gửi email có đính kèm qua AWS SES dùng RAW message.
     */
        public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) {
        try {
            String rawMessage = buildRawMessage(to, subject, body, attachment, filename);
            SendEmailRequest request = SendEmailRequest.builder()
                    .fromEmailAddress(fromEmail)
                    .destination(Destination.builder()
                            .toAddresses(to)
                            .build())
                    .content(EmailContent.builder()
                            .raw(RawMessage.builder()
                                    .data(SdkBytes.fromByteArray(rawMessage.getBytes(StandardCharsets.UTF_8)))
                                    .build())
                            .build())
                    .build();

            sesV2Client.sendEmail(request);
            log.info("Email with attachment sent via AWS SES to {}", to);
        } catch (Exception e) {
            log.error("Failed to send attachment email via AWS SES to {}: {}", to, e.getMessage());
                        throw new RuntimeException("Failed to send attachment email via AWS SES: " + e.getMessage(), e);
        }
    }

    private String buildRawMessage(String to, String subject, String body, byte[] attachment, String filename) {
        String boundary = "----=_Part_" + System.currentTimeMillis();
        String attachmentBase64 = java.util.Base64.getEncoder().encodeToString(attachment);

        return "From: " + fromEmail + "\r\n" +
                "To: " + to + "\r\n" +
                "Subject: " + subject + "\r\n" +
                "MIME-Version: 1.0\r\n" +
                "Content-Type: multipart/mixed; boundary=\"" + boundary + "\"\r\n\r\n" +
                "--" + boundary + "\r\n" +
                "Content-Type: text/plain; charset=UTF-8\r\n" +
                "Content-Transfer-Encoding: 7bit\r\n\r\n" +
                body + "\r\n\r\n" +
                "--" + boundary + "\r\n" +
                "Content-Type: application/octet-stream; name=\"" + filename + "\"\r\n" +
                "Content-Disposition: attachment; filename=\"" + filename + "\"\r\n" +
                "Content-Transfer-Encoding: base64\r\n\r\n" +
                attachmentBase64 + "\r\n\r\n" +
                "--" + boundary + "--";
    }
}

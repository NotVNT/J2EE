package com.example.moneymanager.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class ClientPlatformService {

    public static final String MOBILE_PLATFORM = "mobile";
    private static final String CLIENT_PLATFORM_HEADER = "X-Client-Platform";

    public boolean isMobileClient() {
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (!(requestAttributes instanceof ServletRequestAttributes servletRequestAttributes)) {
            return false;
        }

        HttpServletRequest request = servletRequestAttributes.getRequest();
        if (request == null) {
            return false;
        }

        String clientPlatform = request.getHeader(CLIENT_PLATFORM_HEADER);
        return MOBILE_PLATFORM.equalsIgnoreCase(clientPlatform);
    }
}

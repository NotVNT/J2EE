package com.example.moneymanager.exception;

public class ReceiptImportException extends RuntimeException {
    public ReceiptImportException(String message) {
        super(message);
    }
    public ReceiptImportException(String message, Throwable cause) {
        super(message, cause);
    }
}

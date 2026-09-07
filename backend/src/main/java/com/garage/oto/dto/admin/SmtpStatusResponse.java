package com.garage.oto.dto.admin;

public record SmtpStatusResponse(
    boolean configured,
    String host,
    int port,
    String username,
    String fromAddress,
    String senderName
) {}

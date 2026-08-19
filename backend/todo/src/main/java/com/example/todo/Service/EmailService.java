package com.example.todo.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String toEmail, String subject, String body) {
    	try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("meliora945@gmail.com"); // Must be the same as your configured username
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            System.out.println("Mail sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Error while sending mail: " + e.getMessage());
            e.printStackTrace();
        }
    }
}


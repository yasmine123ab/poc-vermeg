package com.vermeg.pocbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String token, String firstName) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F7FA; padding: 40px 0;">
                  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="background: linear-gradient(135deg, #1F4E79 0%%, #2E75B6 100%%); padding: 28px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">POC Vermeg</h1>
                    </div>
                    <div style="padding: 32px;">
                      <p style="color: #333333; font-size: 15px; line-height: 1.5;">Bonjour %s,</p>
                      <p style="color: #333333; font-size: 15px; line-height: 1.5;">
                        Vous avez demandé la réinitialisation de votre mot de passe sur POC Vermeg.
                        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
                      </p>
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="%s" style="background-color: #1F4E79; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                          Réinitialiser mon mot de passe
                        </a>
                      </div>
                      <p style="color: #888888; font-size: 13px; line-height: 1.5;">
                        Ce lien expire dans <strong>1 heure</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
                      </p>
                    </div>
                    <div style="background-color: #F5F7FA; padding: 16px; text-align: center;">
                      <p style="color: #aaaaaa; font-size: 12px; margin: 0;">&copy; %d Vermeg. Tous droits réservés.</p>
                    </div>
                  </div>
                </div>
                """.formatted(firstName, resetLink, java.time.Year.now().getValue());

        send(toEmail, "Réinitialisation de votre mot de passe — POC Vermeg", html);
    }

    public void sendWelcomeEmail(String toEmail, String firstName) {
        String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F7FA; padding: 40px 0;">
                  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="background: linear-gradient(135deg, #1F4E79 0%%, #2E75B6 100%%); padding: 28px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">POC Vermeg</h1>
                    </div>
                    <div style="padding: 32px;">
                      <p style="color: #333333; font-size: 15px; line-height: 1.5;">Bonjour %s,</p>
                      <p style="color: #333333; font-size: 15px; line-height: 1.5;">
                        Bienvenue sur POC Vermeg ! Votre compte a été créé avec succès.
                        Vous pouvez dès à présent accéder à la plateforme d'orchestration de flux de données.
                      </p>
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="%s" style="background-color: #1F4E79; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                          Accéder à la plateforme
                        </a>
                      </div>
                    </div>
                    <div style="background-color: #F5F7FA; padding: 16px; text-align: center;">
                      <p style="color: #aaaaaa; font-size: 12px; margin: 0;">&copy; %d Vermeg. Tous droits réservés.</p>
                    </div>
                  </div>
                </div>
                """.formatted(firstName, frontendUrl, java.time.Year.now().getValue());

        send(toEmail, "Bienvenue sur POC Vermeg !", html);
    }

    private void send(String toEmail, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}

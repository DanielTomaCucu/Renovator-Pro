package ro.renovatorpro.adapter.out.security;

import org.springframework.stereotype.Component;
import ro.renovatorpro.application.port.out.SecureTokenGenerator;

import java.security.SecureRandom;
import java.util.Base64;

/** 32 bytes = 256 biți de entropie, encodați Base64 URL-safe (fără padding) ca să fie sigur în cookie/header. */
@Component
public class SecureRandomTokenGenerator implements SecureTokenGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public String generate() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}

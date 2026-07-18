package ro.renovatorpro.adapter.out.security;

import org.springframework.stereotype.Component;
import ro.renovatorpro.application.port.out.TokenHasher;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/** SHA-256 e suficient aici — nu apărăm împotriva ghicirii (tokenul are deja ≥256 biți de entropie), doar nu-l stocăm în clar. */
@Component
public class Sha256TokenHasher implements TokenHasher {

    @Override
    public String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponibil în JVM", e);
        }
    }
}

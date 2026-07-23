package ro.renovatorpro.adapter.out.exchangerate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import ro.renovatorpro.application.port.out.ExchangeRateFetcher;
import ro.renovatorpro.domain.exception.ExchangeRateFetchException;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Feed XML public al BNR (Banca Națională a României) — cursul de referință zilnic, gratuit, fără
 * cheie API. Actualizat o dată pe zi lucrătoare de BNR însuși; combinat cu cache-ul de 24h din
 * {@code GetExchangeRateService}, aplicația nu îl interoghează mai des decât atât.
 */
@Component
public class BnrExchangeRateFetcher implements ExchangeRateFetcher {

    private final String feedUrl;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public BnrExchangeRateFetcher(@Value("${app.exchange-rate.bnr-feed-url:https://www.bnr.ro/nbrfxrates.xml}") String feedUrl) {
        this.feedUrl = feedUrl;
    }

    @Override
    public BigDecimal fetchEurToRonRate() {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(feedUrl)).timeout(Duration.ofSeconds(5)).GET().build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() != 200) {
                throw new ExchangeRateFetchException("BNR a răspuns cu status " + response.statusCode(), null);
            }
            return parseEurRate(response.body());
        } catch (ExchangeRateFetchException e) {
            throw e;
        } catch (Exception e) {
            throw new ExchangeRateFetchException("Preluarea cursului valutar de la BNR a eșuat", e);
        }
    }

    private BigDecimal parseEurRate(byte[] xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        // Namespace-aware=false — parsăm doar tag-uri/atribute locale, ignorăm xmlns-ul BNR (simplu și
        // suficient pt. acest feed, evită dependințe suplimentare de XPath cu NamespaceContext).
        factory.setNamespaceAware(false);
        Document doc = factory.newDocumentBuilder().parse(new ByteArrayInputStream(xml));
        NodeList rates = doc.getElementsByTagName("Rate");
        for (int i = 0; i < rates.getLength(); i++) {
            Element rate = (Element) rates.item(i);
            if ("EUR".equals(rate.getAttribute("currency"))) {
                return new BigDecimal(rate.getTextContent().trim());
            }
        }
        throw new ExchangeRateFetchException("Feed-ul BNR nu conține un curs pentru EUR", null);
    }
}

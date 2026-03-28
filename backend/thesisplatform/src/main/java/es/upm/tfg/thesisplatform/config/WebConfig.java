package es.upm.tfg.thesisplatform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration class responsible for static file publication and CORS
 * setup.
 *
 * <p>
 * This configuration enables access to uploaded files through a public URL
 * path and allows cross-origin requests from the frontend application running
 * on the local development server.
 * </p>
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Physical directory where uploaded files are stored.
     */
    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Registers a resource handler to expose uploaded files through the
     * {@code /files/**} URL pattern.
     *
     * @param registry Spring registry used to define resource handlers
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }

    /**
     * Configures cross-origin access rules for API endpoints and uploaded files.
     *
     * <p>
     * This setup allows the frontend running on {@code http://localhost:3000}
     * to consume the REST API and access uploaded CV files during development.
     * </p>
     *
     * @param registry Spring registry used to define CORS mappings
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");

        registry.addMapping("/files/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*");
    }
}
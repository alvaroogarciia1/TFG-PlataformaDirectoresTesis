package es.upm.tfg.thesisplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point of the Thesis Platform Spring Boot application.
 *
 * <p>
 * This class bootstraps the entire backend application, enabling
 * component scanning, auto-configuration and Spring Boot startup.
 * </p>
 */
@SpringBootApplication
public class Application {

	/**
	 * Starts the Spring Boot application.
	 *
	 * @param args startup arguments passed from the command line
	 */
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}
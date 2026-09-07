package com.garage.oto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class GarageApplication {

  public static void main(String[] args) {
    SpringApplication.run(GarageApplication.class, args);
  }
}

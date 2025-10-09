package com.reallink.pump.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    // Forward all non-API, non-static, non-file-extension requests to index.html for React Router
    // This handles React Router's client-side routing when deployed in Tomcat as /pump context
    // When deployed as pump.war, Tomcat serves it at localhost:8080/pump
    @RequestMapping(value = {
        "/{path:^(?!api|assets|fonts|vite\\.svg|favicon\\.ico|manifest\\.json|swagger-ui|v3|api-docs|actuator)[^\\.]*$}",
        "/{path:^(?!api|assets|fonts|vite\\.svg|favicon\\.ico|manifest\\.json|swagger-ui|v3|api-docs|actuator)[^\\.]*$}/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}

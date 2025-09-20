package com.reallink.pump.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    // Forward all non-API, non-static, non-file-extension requests to index.html
    @RequestMapping(value = {"/{path:^(?!api|static|assets|fonts|swagger-ui|v3|api-docs|actuator)[^\\.]*$}",
        "/{path:^(?!api|static|assets|fonts|swagger-ui|v3|api-docs|actuator)[^\\.]*$}/**"})
    public String forward() {
        return "forward:/index.html";
    }
}

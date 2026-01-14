import { Controller, Get } from "@nestjs/common";
import { LeafsService } from "./leafs.service";

@Controller("leafs")
export class LeafsController {
    constructor(private readonly leafs: LeafsService) {}

    @Get("live")
    async live() {
        return this.leafs.getLiveGame();
    }
}
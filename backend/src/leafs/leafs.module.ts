import { Module } from "@nestjs/common";
import { LeafsController } from "./leafs.controller";
import { LeafsService } from "./leafs.service";
import { EspnModule } from "src/espn/espn.module";

@Module({
    imports: [EspnModule],
    controllers: [LeafsController],
    providers: [LeafsService],
})
export class LeafsModule {}
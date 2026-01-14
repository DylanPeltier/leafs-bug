import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { EspnService } from "./espn.service";

@Module({
    imports: [HttpModule],
    providers: [EspnService],
    exports: [EspnService],
})
export class EspnModule {}
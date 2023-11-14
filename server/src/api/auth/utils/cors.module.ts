import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { CorsMiddleware } from "./cors.middleware";

@Module({
})
export class MiddlewareModule implements NestModule {
        configure(consumer: MiddlewareConsumer) {
            consumer.apply(CorsMiddleware).forRoutes('*');
            // consumer.apply(CorsMiddleware).forRoutes({
            // 	path: '*',
            // 	method: RequestMethod.ALL
            // })
        }
}
import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('/ui/')
  redirect() {
    return {};
  }

  @Get('/ui/**')
  @Redirect('/ui/')
  root() {
    return {};
  }
}

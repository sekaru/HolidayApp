import { HolidayAppPage } from './app.po';

describe('holiday-app App', function() {
  let page: HolidayAppPage;

  beforeEach(() => {
    page = new HolidayAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

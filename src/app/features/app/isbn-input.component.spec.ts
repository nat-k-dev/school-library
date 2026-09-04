import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { IsbnInputComponent } from './isbn-input.component';

/**
 * Submits the form the way a browser does: a real `submit` event on the
 * <form>. This is what catches a form without the directive that turns
 * (ngSubmit) on, which otherwise reloads the page in production.
 */
function submitForm(fixture: ComponentFixture<unknown>): boolean {
  const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
  const event = new Event('submit', { cancelable: true, bubbles: true });
  form.dispatchEvent(event);
  fixture.detectChanges();
  return event.defaultPrevented;
}

describe('IsbnInputComponent', () => {
  let fixture: ComponentFixture<IsbnInputComponent>;
  let emitted: string[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IsbnInputComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(IsbnInputComponent);
    emitted = [];
    fixture.componentInstance.isbn.subscribe((isbn) => emitted.push(isbn));
    fixture.detectChanges();
  });

  it('intercepts the native submit and emits the normalised ISBN', () => {
    fixture.componentInstance['form'].setValue({ isbn: '978-90-451-1026-4' });
    const prevented = submitForm(fixture);
    expect(prevented).withContext('native submit must be cancelled, otherwise the page reloads').toBeTrue();
    expect(emitted).toEqual(['9789045110264']);
  });

  it('does not emit an invalid ISBN', () => {
    fixture.componentInstance['form'].setValue({ isbn: '1234' });
    submitForm(fixture);
    expect(emitted).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('geen geldig ISBN');
  });
});

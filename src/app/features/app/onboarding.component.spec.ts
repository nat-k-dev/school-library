import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthService } from '../../core/auth.service';
import { SchoolService } from '../../core/school.service';
import { LibraryService } from '../../services/library.service';
import { StudentsService } from '../../services/students.service';
import { OnboardingComponent } from './onboarding.component';

function submitForm(fixture: ComponentFixture<unknown>, index: number): boolean {
  const form = fixture.nativeElement.querySelectorAll('form')[index] as HTMLFormElement;
  const event = new Event('submit', { cancelable: true, bubbles: true });
  form.dispatchEvent(event);
  fixture.detectChanges();
  return event.defaultPrevented;
}

describe('OnboardingComponent', () => {
  let fixture: ComponentFixture<OnboardingComponent>;
  let school: jasmine.SpyObj<SchoolService> & { schoolId: () => string | null };

  beforeEach(async () => {
    school = Object.assign(jasmine.createSpyObj<SchoolService>('SchoolService', ['createSchool', 'joinSchool']), {
      schoolId: signal<string | null>('s1'),
    });
    school.createSchool.and.resolveTo('s1');
    school.joinSchool.and.resolveTo('s1');

    await TestBed.configureTestingModule({
      imports: [OnboardingComponent],
      providers: [
        provideNoopAnimations(),
        { provide: SchoolService, useValue: school },
        { provide: AuthService, useValue: jasmine.createSpyObj<AuthService>('AuthService', ['logout']) },
        { provide: StudentsService, useValue: jasmine.createSpyObj<StudentsService>('StudentsService', ['importMany']) },
        { provide: LibraryService, useValue: jasmine.createSpyObj<LibraryService>('LibraryService', ['addTitleWithCopies']) },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OnboardingComponent);
    fixture.detectChanges();
  });

  it('creates the school on a real form submit without reloading the page', async () => {
    fixture.componentInstance['createForm'].setValue({ name: 'De Regenboog', demo: false });
    const prevented = submitForm(fixture, 0);
    await fixture.whenStable();

    expect(prevented).withContext('native submit must be cancelled').toBeTrue();
    expect(school.createSchool).toHaveBeenCalledOnceWith('De Regenboog');
  });

  it('joins with the code on a real form submit', async () => {
    fixture.componentInstance['joinForm'].setValue({ code: 'ABC123' });
    const prevented = submitForm(fixture, 1);
    await fixture.whenStable();

    expect(prevented).toBeTrue();
    expect(school.joinSchool).toHaveBeenCalledOnceWith('ABC123');
  });

  it('does nothing but show the error when the name is empty', () => {
    submitForm(fixture, 0);
    expect(school.createSchool).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('verplicht');
  });
});

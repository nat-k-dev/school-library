import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveBookComponent } from './remove-book.component';

describe('RemoveBookComponent', () => {
  let component: RemoveBookComponent;
  let fixture: ComponentFixture<RemoveBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveBookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

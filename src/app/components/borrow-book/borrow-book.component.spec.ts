import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { BooksService, LibraryError } from '../../services/books.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { Book } from '../../shared/models';
import { T } from '../../shared/nl';
import { BorrowBookComponent } from './borrow-book.component';

const book: Book = {
  id: 'abc',
  isbn: '9789045110264',
  title: 'Jip en Janneke',
  author: 'Annie M.G. Schmidt',
  available: true,
  borrowedBy: '',
  group: '',
  borrowedAt: '',
};

describe('BorrowBookComponent', () => {
  let fixture: ComponentFixture<BorrowBookComponent>;
  let books: jasmine.SpyObj<BooksService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  beforeEach(async () => {
    books = jasmine.createSpyObj<BooksService>('BooksService', ['borrowBook']);
    snackBar = jasmine.createSpyObj<SnackBarService>('SnackBarService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [BorrowBookComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: BooksService, useValue: books },
        { provide: SnackBarService, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BorrowBookComponent);
    fixture.detectChanges();
  });

  function fill(values: { isbn: string; childName: string; group: string }) {
    fixture.componentInstance['form'].setValue(values);
  }

  async function submit() {
    await fixture.componentInstance['submit']();
    fixture.detectChanges();
  }

  it('does not call the service when the form is invalid', async () => {
    fill({ isbn: '1234', childName: 'Sem', group: '5' });
    await submit();
    expect(books.borrowBook).not.toHaveBeenCalled();
    expect(fixture.componentInstance['form'].controls.isbn.hasError('isbn')).toBeTrue();
  });

  it('normalises the ISBN and keeps the group after a successful loan', async () => {
    books.borrowBook.and.resolveTo({ ...book, available: false, borrowedBy: 'Sem', group: '5' });
    fill({ isbn: '978-90-451-1026-4', childName: 'Sem', group: '5' });
    await submit();

    expect(books.borrowBook).toHaveBeenCalledOnceWith('9789045110264', 'Sem', '5');
    expect(snackBar.success).toHaveBeenCalledWith(T.borrow.done('Jip en Janneke', 'Sem'));
    expect(fixture.componentInstance['form'].getRawValue()).toEqual({ isbn: '', childName: '', group: '5' });
  });

  it('names the current borrower when the book is already out', async () => {
    books.borrowBook.and.rejectWith(new LibraryError('already-borrowed', { ...book, borrowedBy: 'Noor' }));
    fill({ isbn: '9789045110264', childName: 'Sem', group: '5' });
    await submit();

    expect(snackBar.error).toHaveBeenCalledWith(T.borrow.alreadyBorrowed('Noor'));
  });

  it('reports an unknown ISBN', async () => {
    books.borrowBook.and.rejectWith(new LibraryError('not-found'));
    fill({ isbn: '9789045110264', childName: 'Sem', group: '5' });
    await submit();

    expect(snackBar.error).toHaveBeenCalledWith(T.common.notFound);
  });
});

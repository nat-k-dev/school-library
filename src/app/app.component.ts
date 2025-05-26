import { Component } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Router, RouterModule} from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-root',
  imports: [MatSlideToggleModule, MatButtonModule, MatIconModule, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [ CookieService ],
})
export class AppComponent {
  title = 'School library';

  user$: Observable<User | null>;

  constructor(private authService: AuthService, private router: Router, private cookieService: CookieService) {
    this.user$ = this.authService.currentUser$;
  }

  logout() {
    this.authService.logout();
    this.cookieService.deleteAll();
    this.router.navigateByUrl('login');
  }
}

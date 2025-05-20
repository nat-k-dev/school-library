import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-go-back-button',
  imports: [ MatIconModule, MatButtonModule ],
  templateUrl: './go-back-button.component.html',
  styleUrl: './go-back-button.component.css'
})
export class GoBackButtonComponent {
  constructor(private router: Router) {}

  GoBack() {
    this.router.navigateByUrl('');
  }

}

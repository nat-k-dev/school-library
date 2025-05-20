import { Component } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import { CrownComponent } from "./icons/crown/crown.component";


@Component({
  selector: 'app-root',
  imports: [MatSlideToggleModule, MatButtonModule, MatIconModule, RouterModule, CrownComponent, CrownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Princesschool Biebouders';
}

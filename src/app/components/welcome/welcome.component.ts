import { Component } from '@angular/core';
import { IconCopyComponent } from '../../icons/copy/icon-copy.component';
import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-welcome',
  imports: [IconCopyComponent, ClipboardModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  email = "test@example.com";
  password = "Bieb150";

  copyEmail() {
    navigator.clipboard.writeText(this.email).then().catch(e => console.log(e));

  }

  copyPassword() {
    navigator.clipboard.writeText(this.password).then().catch(e => console.log(e));

  }

}

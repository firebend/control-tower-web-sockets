import { Component, Inject } from '@angular/core';
import {
  faBars,
  faUser,
  faPowerOff,
  faBoltLightning,
  faFilter,
  faPlusCircle,
  faArrowsToCircle,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'ct-rte-ws-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent {
  isCollapsed = true;
  faUser = faUser;
  faPowerOff = faPowerOff;
  faBoltLightning = faBoltLightning;
  faFilter = faFilter;
  faPlusCircle = faPlusCircle;
  faArrowsToCircle = faArrowsToCircle;
  faBars = faBars;

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: this.doc.location.origin,
      },
    });
  }
}

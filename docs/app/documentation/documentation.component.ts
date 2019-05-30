/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { map, takeWhile, withLatestFrom } from 'rxjs/operators';
import { NbMediaBreakpoint, NbMenuItem, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { NgdMenuService } from '../@theme/services/menu.service';
import { NgdPaginationService } from '../@theme/services';
import { animate, animation, query, sequence, style, transition, trigger, useAnimation } from '@angular/animations';

const animationDuration = 150;


const formBounce = animation([
  sequence([

    query(':enter', [
      style({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      }),
    ], { optional: true }),

    query(':enter', [
      style({
        opacity: 0,
      }),
    ], { optional: true }),

    // Animate previous component
    query(':leave', [
      style({
        opacity: 1,
      }),
      animate(animationDuration, style({
        opacity: 0,
      })),
    ], { optional: true }),


    // // Animate next component
    query(':enter', [
      style({
        opacity: 0,
      }),
      animate(animationDuration, style({
        opacity: 1,
      })),
    ], { optional: true }),

  ]),
]);

export const routeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [useAnimation(formBounce)]),
]);

@Component({
  selector: 'ngd-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss'],
  animations: [routeAnimation],
})
export class NgdDocumentationComponent implements OnDestroy {
  menuItems: NbMenuItem[] = [];
  collapsedBreakpoints = ['xs', 'is', 'sm', 'md', 'lg'];
  sidebarTag = 'menuSidebar';

  private alive = true;

  constructor(
    private service: NgdMenuService,
    private router: Router,
    private themeService: NbThemeService,
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private paginationService: NgdPaginationService) {

    this.themeService.changeTheme('docs-page');
    this.paginationService.setPaginationItems('/docs');
    this.menuItems = this.service.getPreparedMenu('/docs');

    // TODO: can we do any better?
    this.router.events
      .pipe(
        withLatestFrom(this.themeService.onMediaQueryChange().pipe(map((changes: any[]) => changes[1]))),
        takeWhile(() => this.alive),
      )
      .subscribe(([event, mediaQuery]: [any, NbMediaBreakpoint]) => {
        if (event.url === '/docs') {
          const firstMenuItem = this.menuItems[0].children[0];
          // angular bug with replaceUrl, temp fix with setTimeout
          setTimeout(() => this.router.navigateByUrl(firstMenuItem.link, { replaceUrl: true }));
        }

        if (this.collapsedBreakpoints.includes(mediaQuery.name)) {
          this.sidebarService.collapse(this.sidebarTag);
        }
      });
  }

  collapseMenu() {
    this.menuService.collapseAll('leftMenu');
  }

  ngOnDestroy() {
    this.alive = false;
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRoute && outlet.activatedRoute.snapshot.url;
  }
}

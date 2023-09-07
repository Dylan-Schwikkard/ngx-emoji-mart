import { Component, EventEmitter, Input, Output, ViewChild, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, fromEvent, takeUntil } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "./emoji-search.service";
import * as i2 from "@angular/forms";
let id = 0;
class SearchComponent {
    ngZone;
    emojiSearch;
    maxResults = 75;
    autoFocus = false;
    i18n;
    include = [];
    exclude = [];
    custom = [];
    icons;
    emojisToShowFilter;
    searchResults = new EventEmitter();
    enterKeyOutsideAngular = new EventEmitter();
    inputRef;
    isSearching = false;
    icon;
    query = '';
    inputId = `emoji-mart-search-${++id}`;
    destroy$ = new Subject();
    constructor(ngZone, emojiSearch) {
        this.ngZone = ngZone;
        this.emojiSearch = emojiSearch;
    }
    ngOnInit() {
        this.icon = this.icons.search;
        this.setupKeyupListener();
    }
    ngAfterViewInit() {
        if (this.autoFocus) {
            this.inputRef.nativeElement.focus();
        }
    }
    ngOnDestroy() {
        this.destroy$.next();
    }
    clear() {
        this.query = '';
        this.handleSearch('');
        this.inputRef.nativeElement.focus();
    }
    handleSearch(value) {
        if (value === '') {
            this.icon = this.icons.search;
            this.isSearching = false;
        }
        else {
            this.icon = this.icons.delete;
            this.isSearching = true;
        }
        const emojis = this.emojiSearch.search(this.query, this.emojisToShowFilter, this.maxResults, this.include, this.exclude, this.custom);
        this.searchResults.emit(emojis);
    }
    handleChange() {
        this.handleSearch(this.query);
    }
    setupKeyupListener() {
        this.ngZone.runOutsideAngular(() => fromEvent(this.inputRef.nativeElement, 'keyup')
            .pipe(takeUntil(this.destroy$))
            .subscribe($event => {
            if (!this.query || $event.key !== 'Enter') {
                return;
            }
            this.enterKeyOutsideAngular.emit($event);
            $event.preventDefault();
        }));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.5", ngImport: i0, type: SearchComponent, deps: [{ token: i0.NgZone }, { token: i1.EmojiSearch }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.0.5", type: SearchComponent, isStandalone: true, selector: "emoji-search", inputs: { maxResults: "maxResults", autoFocus: "autoFocus", i18n: "i18n", include: "include", exclude: "exclude", custom: "custom", icons: "icons", emojisToShowFilter: "emojisToShowFilter" }, outputs: { searchResults: "searchResults", enterKeyOutsideAngular: "enterKeyOutsideAngular" }, viewQueries: [{ propertyName: "inputRef", first: true, predicate: ["inputRef"], descendants: true, static: true }], ngImport: i0, template: `
    <div class="emoji-mart-search">
      <input
        [id]="inputId"
        #inputRef
        type="search"
        [placeholder]="i18n.search"
        [autofocus]="autoFocus"
        [(ngModel)]="query"
        (ngModelChange)="handleChange()"
      />
      <!--
      Use a <label> in addition to the placeholder for accessibility, but place it off-screen
      http://www.maxability.co.in/2016/01/placeholder-attribute-and-why-it-is-not-accessible/
      -->
      <label class="emoji-mart-sr-only" [htmlFor]="inputId">
        {{ i18n.search }}
      </label>
      <button
        type="button"
        class="emoji-mart-search-icon"
        (click)="clear()"
        (keyup.enter)="clear()"
        [disabled]="!isSearching"
        [attr.aria-label]="i18n.clear"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          width="13"
          height="13"
          opacity="0.5"
        >
          <path [attr.d]="icon" />
        </svg>
      </button>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }] });
}
export { SearchComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.5", ngImport: i0, type: SearchComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'emoji-search',
                    template: `
    <div class="emoji-mart-search">
      <input
        [id]="inputId"
        #inputRef
        type="search"
        [placeholder]="i18n.search"
        [autofocus]="autoFocus"
        [(ngModel)]="query"
        (ngModelChange)="handleChange()"
      />
      <!--
      Use a <label> in addition to the placeholder for accessibility, but place it off-screen
      http://www.maxability.co.in/2016/01/placeholder-attribute-and-why-it-is-not-accessible/
      -->
      <label class="emoji-mart-sr-only" [htmlFor]="inputId">
        {{ i18n.search }}
      </label>
      <button
        type="button"
        class="emoji-mart-search-icon"
        (click)="clear()"
        (keyup.enter)="clear()"
        [disabled]="!isSearching"
        [attr.aria-label]="i18n.clear"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          width="13"
          height="13"
          opacity="0.5"
        >
          <path [attr.d]="icon" />
        </svg>
      </button>
    </div>
  `,
                    preserveWhitespaces: false,
                    standalone: true,
                    imports: [FormsModule],
                }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: i1.EmojiSearch }]; }, propDecorators: { maxResults: [{
                type: Input
            }], autoFocus: [{
                type: Input
            }], i18n: [{
                type: Input
            }], include: [{
                type: Input
            }], exclude: [{
                type: Input
            }], custom: [{
                type: Input
            }], icons: [{
                type: Input
            }], emojisToShowFilter: [{
                type: Input
            }], searchResults: [{
                type: Output
            }], enterKeyOutsideAngular: [{
                type: Output
            }], inputRef: [{
                type: ViewChild,
                args: ['inputRef', { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcGlja2VyL3NlYXJjaC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFNBQVMsRUFFVCxZQUFZLEVBQ1osS0FBSyxFQUlMLE1BQU0sRUFDTixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRzdDLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztBQUVyRCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFWCxNQTRDYSxlQUFlO0lBbUJOO0lBQXdCO0lBbEJuQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDbEIsSUFBSSxDQUFNO0lBQ1YsT0FBTyxHQUFhLEVBQUUsQ0FBQztJQUN2QixPQUFPLEdBQWEsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sR0FBVSxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUE2QjtJQUNsQyxrQkFBa0IsQ0FBdUI7SUFDeEMsYUFBYSxHQUFHLElBQUksWUFBWSxFQUFTLENBQUM7SUFDMUMsc0JBQXNCLEdBQUcsSUFBSSxZQUFZLEVBQWlCLENBQUM7SUFDcEIsUUFBUSxDQUFnQztJQUN6RixXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQ3BCLElBQUksQ0FBVTtJQUNkLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDWCxPQUFPLEdBQUcscUJBQXFCLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFFOUIsUUFBUSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFFdkMsWUFBb0IsTUFBYyxFQUFVLFdBQXdCO1FBQWhELFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtJQUFHLENBQUM7SUFFeEUsUUFB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QUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLGtCQUFrQjtzQkFBMUIsS0FBSztnQkFDSSxhQUFhO3NCQUF0QixNQUFNO2dCQUNHLHNCQUFzQjtzQkFBL0IsTUFBTTtnQkFDMEMsUUFBUTtzQkFBeEQsU0FBUzt1QkFBQyxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFZpZXdDaGlsZCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgRW1vamlTZWFyY2ggfSBmcm9tICcuL2Vtb2ppLXNlYXJjaC5zZXJ2aWNlJztcbmltcG9ydCB7IFN1YmplY3QsIGZyb21FdmVudCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcyc7XG5cbmxldCBpZCA9IDA7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2Vtb2ppLXNlYXJjaCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cImVtb2ppLW1hcnQtc2VhcmNoXCI+XG4gICAgICA8aW5wdXRcbiAgICAgICAgW2lkXT1cImlucHV0SWRcIlxuICAgICAgICAjaW5wdXRSZWZcbiAgICAgICAgdHlwZT1cInNlYXJjaFwiXG4gICAgICAgIFtwbGFjZWhvbGRlcl09XCJpMThuLnNlYXJjaFwiXG4gICAgICAgIFthdXRvZm9jdXNdPVwiYXV0b0ZvY3VzXCJcbiAgICAgICAgWyhuZ01vZGVsKV09XCJxdWVyeVwiXG4gICAgICAgIChuZ01vZGVsQ2hhbmdlKT1cImhhbmRsZUNoYW5nZSgpXCJcbiAgICAgIC8+XG4gICAgICA8IS0tXG4gICAgICBVc2UgYSA8bGFiZWw+IGluIGFkZGl0aW9uIHRvIHRoZSBwbGFjZWhvbGRlciBmb3IgYWNjZXNzaWJpbGl0eSwgYnV0IHBsYWNlIGl0IG9mZi1zY3JlZW5cbiAgICAgIGh0dHA6Ly93d3cubWF4YWJpbGl0eS5jby5pbi8yMDE2LzAxL3BsYWNlaG9sZGVyLWF0dHJpYnV0ZS1hbmQtd2h5LWl0LWlzLW5vdC1hY2Nlc3NpYmxlL1xuICAgICAgLS0+XG4gICAgICA8bGFiZWwgY2xhc3M9XCJlbW9qaS1tYXJ0LXNyLW9ubHlcIiBbaHRtbEZvcl09XCJpbnB1dElkXCI+XG4gICAgICAgIHt7IGkxOG4uc2VhcmNoIH19XG4gICAgICA8L2xhYmVsPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3M9XCJlbW9qaS1tYXJ0LXNlYXJjaC1pY29uXCJcbiAgICAgICAgKGNsaWNrKT1cImNsZWFyKClcIlxuICAgICAgICAoa2V5dXAuZW50ZXIpPVwiY2xlYXIoKVwiXG4gICAgICAgIFtkaXNhYmxlZF09XCIhaXNTZWFyY2hpbmdcIlxuICAgICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cImkxOG4uY2xlYXJcIlxuICAgICAgPlxuICAgICAgICA8c3ZnXG4gICAgICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gICAgICAgICAgdmlld0JveD1cIjAgMCAyMCAyMFwiXG4gICAgICAgICAgd2lkdGg9XCIxM1wiXG4gICAgICAgICAgaGVpZ2h0PVwiMTNcIlxuICAgICAgICAgIG9wYWNpdHk9XCIwLjVcIlxuICAgICAgICA+XG4gICAgICAgICAgPHBhdGggW2F0dHIuZF09XCJpY29uXCIgLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgcHJlc2VydmVXaGl0ZXNwYWNlczogZmFsc2UsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtGb3Jtc01vZHVsZV0sXG59KVxuZXhwb3J0IGNsYXNzIFNlYXJjaENvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgbWF4UmVzdWx0cyA9IDc1O1xuICBASW5wdXQoKSBhdXRvRm9jdXMgPSBmYWxzZTtcbiAgQElucHV0KCkgaTE4bjogYW55O1xuICBASW5wdXQoKSBpbmNsdWRlOiBzdHJpbmdbXSA9IFtdO1xuICBASW5wdXQoKSBleGNsdWRlOiBzdHJpbmdbXSA9IFtdO1xuICBASW5wdXQoKSBjdXN0b206IGFueVtdID0gW107XG4gIEBJbnB1dCgpIGljb25zITogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgQElucHV0KCkgZW1vamlzVG9TaG93RmlsdGVyPzogKHg6IGFueSkgPT4gYm9vbGVhbjtcbiAgQE91dHB1dCgpIHNlYXJjaFJlc3VsdHMgPSBuZXcgRXZlbnRFbWl0dGVyPGFueVtdPigpO1xuICBAT3V0cHV0KCkgZW50ZXJLZXlPdXRzaWRlQW5ndWxhciA9IG5ldyBFdmVudEVtaXR0ZXI8S2V5Ym9hcmRFdmVudD4oKTtcbiAgQFZpZXdDaGlsZCgnaW5wdXRSZWYnLCB7IHN0YXRpYzogdHJ1ZSB9KSBwcml2YXRlIGlucHV0UmVmITogRWxlbWVudFJlZjxIVE1MSW5wdXRFbGVtZW50PjtcbiAgaXNTZWFyY2hpbmcgPSBmYWxzZTtcbiAgaWNvbj86IHN0cmluZztcbiAgcXVlcnkgPSAnJztcbiAgaW5wdXRJZCA9IGBlbW9qaS1tYXJ0LXNlYXJjaC0keysraWR9YDtcblxuICBwcml2YXRlIGRlc3Ryb3kkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5nWm9uZTogTmdab25lLCBwcml2YXRlIGVtb2ppU2VhcmNoOiBFbW9qaVNlYXJjaCkge31cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLmljb24gPSB0aGlzLmljb25zLnNlYXJjaDtcbiAgICB0aGlzLnNldHVwS2V5dXBMaXN0ZW5lcigpO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIGlmICh0aGlzLmF1dG9Gb2N1cykge1xuICAgICAgdGhpcy5pbnB1dFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95JC5uZXh0KCk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnF1ZXJ5ID0gJyc7XG4gICAgdGhpcy5oYW5kbGVTZWFyY2goJycpO1xuICAgIHRoaXMuaW5wdXRSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICB9XG5cbiAgaGFuZGxlU2VhcmNoKHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICB0aGlzLmljb24gPSB0aGlzLmljb25zLnNlYXJjaDtcbiAgICAgIHRoaXMuaXNTZWFyY2hpbmcgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pY29uID0gdGhpcy5pY29ucy5kZWxldGU7XG4gICAgICB0aGlzLmlzU2VhcmNoaW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgY29uc3QgZW1vamlzID0gdGhpcy5lbW9qaVNlYXJjaC5zZWFyY2goXG4gICAgICB0aGlzLnF1ZXJ5LFxuICAgICAgdGhpcy5lbW9qaXNUb1Nob3dGaWx0ZXIsXG4gICAgICB0aGlzLm1heFJlc3VsdHMsXG4gICAgICB0aGlzLmluY2x1ZGUsXG4gICAgICB0aGlzLmV4Y2x1ZGUsXG4gICAgICB0aGlzLmN1c3RvbSxcbiAgICApIGFzIGFueVtdO1xuICAgIHRoaXMuc2VhcmNoUmVzdWx0cy5lbWl0KGVtb2ppcyk7XG4gIH1cblxuICBoYW5kbGVDaGFuZ2UoKSB7XG4gICAgdGhpcy5oYW5kbGVTZWFyY2godGhpcy5xdWVyeSk7XG4gIH1cblxuICBwcml2YXRlIHNldHVwS2V5dXBMaXN0ZW5lcigpOiB2b2lkIHtcbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PlxuICAgICAgZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KHRoaXMuaW5wdXRSZWYubmF0aXZlRWxlbWVudCwgJ2tleXVwJylcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveSQpKVxuICAgICAgICAuc3Vic2NyaWJlKCRldmVudCA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnF1ZXJ5IHx8ICRldmVudC5rZXkgIT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5lbnRlcktleU91dHNpZGVBbmd1bGFyLmVtaXQoJGV2ZW50KTtcbiAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSksXG4gICAgKTtcbiAgfVxufVxuIl19
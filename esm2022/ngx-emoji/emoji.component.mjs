import { ChangeDetectionStrategy, Component, EventEmitter, Input, NgZone, Output, ViewChild, inject, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EMPTY, Subject, fromEvent, switchMap, takeUntil } from 'rxjs';
import { DEFAULT_BACKGROUNDFN, EmojiService } from './emoji.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
class EmojiComponent {
    skin = 1;
    set = 'apple';
    sheetSize = 64;
    /** Renders the native unicode emoji */
    isNative = false;
    forceSize = false;
    tooltip = false;
    size = 24;
    emoji = '';
    fallback;
    hideObsolete = false;
    sheetRows;
    sheetColumns;
    useButton;
    /**
     * Note: `emojiOver` and `emojiOverOutsideAngular` are dispatched on the same event (`mouseenter`), but
     *       for different purposes. The `emojiOverOutsideAngular` event is listened only in `emoji-category`
     *       component and the category component doesn't care about zone context the callback is being called in.
     *       The `emojiOver` is for backwards compatibility if anyone is listening to this event explicitly in their code.
     */
    emojiOver = new EventEmitter();
    emojiOverOutsideAngular = new EventEmitter();
    /** See comments above, this serves the same purpose. */
    emojiLeave = new EventEmitter();
    emojiLeaveOutsideAngular = new EventEmitter();
    emojiClick = new EventEmitter();
    emojiClickOutsideAngular = new EventEmitter();
    style;
    title = undefined;
    label = '';
    unified;
    custom = false;
    isVisible = true;
    // TODO: replace 4.0.3 w/ dynamic get verison from emoji-datasource in package.json
    backgroundImageFn = DEFAULT_BACKGROUNDFN;
    imageUrlFn;
    set button(button) {
        // Note: `runOutsideAngular` is used to trigger `addEventListener` outside of the Angular zone
        //       too. See `setupMouseEnterListener`. The `switchMap` will subscribe to `fromEvent` considering
        //       the context where the factory is called in.
        this.ngZone.runOutsideAngular(() => this.button$.next(button?.nativeElement));
    }
    /**
     * The subject used to emit whenever view queries are run and `button` or `span` is set/removed.
     * We use subject to keep the reactive behavior so we don't have to add and remove event listeners manually.
     */
    button$ = new Subject();
    destroy$ = new Subject();
    ngZone = inject(NgZone);
    emojiService = inject(EmojiService);
    constructor() {
        this.setupMouseListeners();
    }
    ngOnChanges() {
        if (!this.emoji) {
            return (this.isVisible = false);
        }
        const data = this.getData();
        if (!data) {
            return (this.isVisible = false);
        }
        // const children = this.children;
        this.unified = data.native || null;
        if (data.custom) {
            this.custom = data.custom;
        }
        if (!data.unified && !data.custom) {
            return (this.isVisible = false);
        }
        if (this.tooltip) {
            this.title = data.shortNames[0];
        }
        if (data.obsoletedBy && this.hideObsolete) {
            return (this.isVisible = false);
        }
        this.label = [data.native].concat(data.shortNames).filter(Boolean).join(', ');
        if (this.isNative && data.unified && data.native) {
            // hide older emoji before the split into gendered emoji
            this.style = { fontSize: `${this.size}px` };
            if (this.forceSize) {
                this.style.display = 'inline-block';
                this.style.width = `${this.size}px`;
                this.style.height = `${this.size}px`;
                this.style['word-break'] = 'keep-all';
            }
        }
        else if (data.custom) {
            this.style = {
                width: `${this.size}px`,
                height: `${this.size}px`,
                display: 'inline-block',
            };
            if (data.spriteUrl && this.sheetRows && this.sheetColumns) {
                this.style = {
                    ...this.style,
                    backgroundImage: `url(${data.spriteUrl})`,
                    backgroundSize: `${100 * this.sheetColumns}% ${100 * this.sheetRows}%`,
                    backgroundPosition: this.emojiService.getSpritePosition(data.sheet, this.sheetColumns),
                };
            }
            else {
                this.style = {
                    ...this.style,
                    backgroundImage: `url(${data.imageUrl})`,
                    backgroundSize: 'contain',
                };
            }
        }
        else {
            if (data.hidden.length && data.hidden.includes(this.set)) {
                if (this.fallback) {
                    this.style = { fontSize: `${this.size}px` };
                    this.unified = this.fallback(data, this);
                }
                else {
                    return (this.isVisible = false);
                }
            }
            else {
                this.style = this.emojiService.emojiSpriteStyles(data.sheet, this.set, this.size, this.sheetSize, this.sheetRows, this.backgroundImageFn, this.sheetColumns, this.imageUrlFn?.(this.getData()));
            }
        }
        return (this.isVisible = true);
    }
    ngOnDestroy() {
        this.destroy$.next();
    }
    getData() {
        return this.emojiService.getData(this.emoji, this.skin, this.set);
    }
    getSanitizedData() {
        return this.emojiService.getSanitizedData(this.emoji, this.skin, this.set);
    }
    setupMouseListeners() {
        const eventListener$ = (eventName) => this.button$.pipe(
        // Note: `EMPTY` is used to remove event listener once the DOM node is removed.
        switchMap(button => (button ? fromEvent(button, eventName) : EMPTY)), takeUntil(this.destroy$));
        eventListener$('click').subscribe($event => {
            const emoji = this.getSanitizedData();
            this.emojiClickOutsideAngular.emit({ emoji, $event });
            // Note: this is done for backwards compatibility. We run change detection if developers
            //       are listening to `emojiClick` in their code. For instance:
            //       `<ngx-emoji (emojiClick)="..."></ngx-emoji>`.
            if (this.emojiClick.observed) {
                this.ngZone.run(() => this.emojiClick.emit({ emoji, $event }));
            }
        });
        eventListener$('mouseenter').subscribe($event => {
            const emoji = this.getSanitizedData();
            this.emojiOverOutsideAngular.emit({ emoji, $event });
            // Note: this is done for backwards compatibility. We run change detection if developers
            //       are listening to `emojiOver` in their code. For instance:
            //       `<ngx-emoji (emojiOver)="..."></ngx-emoji>`.
            if (this.emojiOver.observed) {
                this.ngZone.run(() => this.emojiOver.emit({ emoji, $event }));
            }
        });
        eventListener$('mouseleave').subscribe($event => {
            const emoji = this.getSanitizedData();
            this.emojiLeaveOutsideAngular.emit({ emoji, $event });
            // Note: this is done for backwards compatibility. We run change detection if developers
            //       are listening to `emojiLeave` in their code. For instance:
            //       `<ngx-emoji (emojiLeave)="..."></ngx-emoji>`.
            if (this.emojiLeave.observed) {
                this.ngZone.run(() => this.emojiLeave.emit({ emoji, $event }));
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.5", ngImport: i0, type: EmojiComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.0.5", type: EmojiComponent, isStandalone: true, selector: "ngx-emoji", inputs: { skin: "skin", set: "set", sheetSize: "sheetSize", isNative: "isNative", forceSize: "forceSize", tooltip: "tooltip", size: "size", emoji: "emoji", fallback: "fallback", hideObsolete: "hideObsolete", sheetRows: "sheetRows", sheetColumns: "sheetColumns", useButton: "useButton", backgroundImageFn: "backgroundImageFn", imageUrlFn: "imageUrlFn" }, outputs: { emojiOver: "emojiOver", emojiOverOutsideAngular: "emojiOverOutsideAngular", emojiLeave: "emojiLeave", emojiLeaveOutsideAngular: "emojiLeaveOutsideAngular", emojiClick: "emojiClick", emojiClickOutsideAngular: "emojiClickOutsideAngular" }, viewQueries: [{ propertyName: "button", first: true, predicate: ["button"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <ng-template [ngIf]="isVisible">
      <button
        *ngIf="useButton; else spanTpl"
        #button
        type="button"
        [attr.title]="title"
        [attr.aria-label]="label"
        class="emoji-mart-emoji"
        [class.emoji-mart-emoji-native]="isNative"
        [class.emoji-mart-emoji-custom]="custom"
      >
        <span [ngStyle]="style">
          <ng-template [ngIf]="isNative">{{ unified }}</ng-template>
          <ng-content></ng-content>
        </span>
      </button>
    </ng-template>

    <ng-template #spanTpl>
      <span
        #button
        [attr.title]="title"
        [attr.aria-label]="label"
        class="emoji-mart-emoji"
        [class.emoji-mart-emoji-native]="isNative"
        [class.emoji-mart-emoji-custom]="custom"
      >
        <span [ngStyle]="style">
          <ng-template [ngIf]="isNative">{{ unified }}</ng-template>
          <ng-content></ng-content>
        </span>
      </span>
    </ng-template>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
export { EmojiComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.5", ngImport: i0, type: EmojiComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-emoji',
                    template: `
    <ng-template [ngIf]="isVisible">
      <button
        *ngIf="useButton; else spanTpl"
        #button
        type="button"
        [attr.title]="title"
        [attr.aria-label]="label"
        class="emoji-mart-emoji"
        [class.emoji-mart-emoji-native]="isNative"
        [class.emoji-mart-emoji-custom]="custom"
      >
        <span [ngStyle]="style">
          <ng-template [ngIf]="isNative">{{ unified }}</ng-template>
          <ng-content></ng-content>
        </span>
      </button>
    </ng-template>

    <ng-template #spanTpl>
      <span
        #button
        [attr.title]="title"
        [attr.aria-label]="label"
        class="emoji-mart-emoji"
        [class.emoji-mart-emoji-native]="isNative"
        [class.emoji-mart-emoji-custom]="custom"
      >
        <span [ngStyle]="style">
          <ng-template [ngIf]="isNative">{{ unified }}</ng-template>
          <ng-content></ng-content>
        </span>
      </span>
    </ng-template>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    preserveWhitespaces: false,
                    standalone: true,
                    imports: [CommonModule],
                }]
        }], ctorParameters: function () { return []; }, propDecorators: { skin: [{
                type: Input
            }], set: [{
                type: Input
            }], sheetSize: [{
                type: Input
            }], isNative: [{
                type: Input
            }], forceSize: [{
                type: Input
            }], tooltip: [{
                type: Input
            }], size: [{
                type: Input
            }], emoji: [{
                type: Input
            }], fallback: [{
                type: Input
            }], hideObsolete: [{
                type: Input
            }], sheetRows: [{
                type: Input
            }], sheetColumns: [{
                type: Input
            }], useButton: [{
                type: Input
            }], emojiOver: [{
                type: Output
            }], emojiOverOutsideAngular: [{
                type: Output
            }], emojiLeave: [{
                type: Output
            }], emojiLeaveOutsideAngular: [{
                type: Output
            }], emojiClick: [{
                type: Output
            }], emojiClickOutsideAngular: [{
                type: Output
            }], backgroundImageFn: [{
                type: Input
            }], imageUrlFn: [{
                type: Input
            }], button: [{
                type: ViewChild,
                args: ['button', { static: false }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9waWNrZXIvbmd4LWVtb2ppL2Vtb2ppLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFFVCxZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFHTixNQUFNLEVBQ04sU0FBUyxFQUNULE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFHdkUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDOzs7QUEwQnJFLE1BMENhLGNBQWM7SUFDaEIsSUFBSSxHQUFrQixDQUFDLENBQUM7SUFDeEIsR0FBRyxHQUFpQixPQUFPLENBQUM7SUFDNUIsU0FBUyxHQUF1QixFQUFFLENBQUM7SUFDNUMsdUNBQXVDO0lBQzlCLFFBQVEsR0FBc0IsS0FBSyxDQUFDO0lBQ3BDLFNBQVMsR0FBdUIsS0FBSyxDQUFDO0lBQ3RDLE9BQU8sR0FBcUIsS0FBSyxDQUFDO0lBQ2xDLElBQUksR0FBa0IsRUFBRSxDQUFDO0lBQ3pCLEtBQUssR0FBbUIsRUFBRSxDQUFDO0lBQzNCLFFBQVEsQ0FBcUI7SUFDN0IsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUNyQixTQUFTLENBQVU7SUFDbkIsWUFBWSxDQUFVO0lBQ3RCLFNBQVMsQ0FBVztJQUM3Qjs7Ozs7T0FLRztJQUNPLFNBQVMsR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUNuRCx1QkFBdUIsR0FBdUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUMzRSx3REFBd0Q7SUFDOUMsVUFBVSxHQUF3QixJ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LENBQUMsTUFBTTtvQkFDL0MsbUJBQW1CLEVBQUUsS0FBSztvQkFDMUIsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztpQkFDeEI7MEVBRVUsSUFBSTtzQkFBWixLQUFLO2dCQUNHLEdBQUc7c0JBQVgsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUVHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxPQUFPO3NCQUFmLEtBQUs7Z0JBQ0csSUFBSTtzQkFBWixLQUFLO2dCQUNHLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxZQUFZO3NCQUFwQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBT0ksU0FBUztzQkFBbEIsTUFBTTtnQkFDRyx1QkFBdUI7c0JBQWhDLE1BQU07Z0JBRUcsVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyx3QkFBd0I7c0JBQWpDLE1BQU07Z0JBQ0csVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyx3QkFBd0I7c0JBQWpDLE1BQU07Z0JBU0UsaUJBQWlCO3NCQUF6QixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBR0YsTUFBTTtzQkFEVCxTQUFTO3VCQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPdXRwdXQsXG4gIFZpZXdDaGlsZCxcbiAgaW5qZWN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBFTVBUWSwgU3ViamVjdCwgZnJvbUV2ZW50LCBzd2l0Y2hNYXAsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBFbW9qaURhdGEgfSBmcm9tICcuL2RhdGEvZGF0YS5pbnRlcmZhY2VzJztcbmltcG9ydCB7IERFRkFVTFRfQkFDS0dST1VOREZOLCBFbW9qaVNlcnZpY2UgfSBmcm9tICcuL2Vtb2ppLnNlcnZpY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVtb2ppIHtcbiAgLyoqIFJlbmRlcnMgdGhlIG5hdGl2ZSB1bmljb2RlIGVtb2ppICovXG4gIGlzTmF0aXZlOiBib29sZWFuO1xuICBmb3JjZVNpemU6IGJvb2xlYW47XG4gIHRvb2x0aXA6IGJvb2xlYW47XG4gIHNraW46IDEgfCAyIHwgMyB8IDQgfCA1IHwgNjtcbiAgc2hlZXRTaXplOiAxNiB8IDIwIHwgMzIgfCA2NCB8IDcyO1xuICBzaGVldFJvd3M/OiBudW1iZXI7XG4gIHNldDogJ2FwcGxlJyB8ICdnb29nbGUnIHwgJ3R3aXR0ZXInIHwgJ2ZhY2Vib29rJyB8ICcnO1xuICBzaXplOiBudW1iZXI7XG4gIGVtb2ppOiBzdHJpbmcgfCBFbW9qaURhdGE7XG4gIGJhY2tncm91bmRJbWFnZUZuOiAoc2V0OiBzdHJpbmcsIHNoZWV0U2l6ZTogbnVtYmVyKSA9PiBzdHJpbmc7XG4gIGZhbGxiYWNrPzogKGRhdGE6IGFueSwgcHJvcHM6IGFueSkgPT4gc3RyaW5nO1xuICBlbW9qaU92ZXI6IEV2ZW50RW1pdHRlcjxFbW9qaUV2ZW50PjtcbiAgZW1vamlMZWF2ZTogRXZlbnRFbWl0dGVyPEVtb2ppRXZlbnQ+O1xuICBlbW9qaUNsaWNrOiBFdmVudEVtaXR0ZXI8RW1vamlFdmVudD47XG4gIGltYWdlVXJsRm4/OiAoZW1vamk6IEVtb2ppRGF0YSB8IG51bGwpID0+IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbW9qaUV2ZW50IHtcbiAgZW1vamk6IEVtb2ppRGF0YTtcbiAgJGV2ZW50OiBFdmVudDtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmd4LWVtb2ppJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctdGVtcGxhdGUgW25nSWZdPVwiaXNWaXNpYmxlXCI+XG4gICAgICA8YnV0dG9uXG4gICAgICAgICpuZ0lmPVwidXNlQnV0dG9uOyBlbHNlIHNwYW5UcGxcIlxuICAgICAgICAjYnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBbYXR0ci50aXRsZV09XCJ0aXRsZVwiXG4gICAgICAgIFthdHRyLmFyaWEtbGFiZWxdPVwibGFiZWxcIlxuICAgICAgICBjbGFzcz1cImVtb2ppLW1hcnQtZW1vamlcIlxuICAgICAgICBbY2xhc3MuZW1vamktbWFydC1lbW9qaS1uYXRpdmVdPVwiaXNOYXRpdmVcIlxuICAgICAgICBbY2xhc3MuZW1vamktbWFydC1lbW9qaS1jdXN0b21dPVwiY3VzdG9tXCJcbiAgICAgID5cbiAgICAgICAgPHNwYW4gW25nU3R5bGVdPVwic3R5bGVcIj5cbiAgICAgICAgICA8bmctdGVtcGxhdGUgW25nSWZdPVwiaXNOYXRpdmVcIj57eyB1bmlmaWVkIH19PC9uZy10ZW1wbGF0ZT5cbiAgICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvbmctdGVtcGxhdGU+XG5cbiAgICA8bmctdGVtcGxhdGUgI3NwYW5UcGw+XG4gICAgICA8c3BhblxuICAgICAgICAjYnV0dG9uXG4gICAgICAgIFthdHRyLnRpdGxlXT1cInRpdGxlXCJcbiAgICAgICAgW2F0dHIuYXJpYS1sYWJlbF09XCJsYWJlbFwiXG4gICAgICAgIGNsYXNzPVwiZW1vamktbWFydC1lbW9qaVwiXG4gICAgICAgIFtjbGFzcy5lbW9qaS1tYXJ0LWVtb2ppLW5hdGl2ZV09XCJpc05hdGl2ZVwiXG4gICAgICAgIFtjbGFzcy5lbW9qaS1tYXJ0LWVtb2ppLWN1c3RvbV09XCJjdXN0b21cIlxuICAgICAgPlxuICAgICAgICA8c3BhbiBbbmdTdHlsZV09XCJzdHlsZVwiPlxuICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdJZl09XCJpc05hdGl2ZVwiPnt7IHVuaWZpZWQgfX08L25nLXRlbXBsYXRlPlxuICAgICAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9zcGFuPlxuICAgIDwvbmctdGVtcGxhdGU+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBmYWxzZSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXG59KVxuZXhwb3J0IGNsYXNzIEVtb2ppQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzLCBFbW9qaSwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgc2tpbjogRW1vamlbJ3NraW4nXSA9IDE7XG4gIEBJbnB1dCgpIHNldDogRW1vamlbJ3NldCddID0gJ2FwcGxlJztcbiAgQElucHV0KCkgc2hlZXRTaXplOiBFbW9qaVsnc2hlZXRTaXplJ10gPSA2NDtcbiAgLyoqIFJlbmRlcnMgdGhlIG5hdGl2ZSB1bmljb2RlIGVtb2ppICovXG4gIEBJbnB1dCgpIGlzTmF0aXZlOiBFbW9qaVsnaXNOYXRpdmUnXSA9IGZhbHNlO1xuICBASW5wdXQoKSBmb3JjZVNpemU6IEVtb2ppWydmb3JjZVNpemUnXSA9IGZhbHNlO1xuICBASW5wdXQoKSB0b29sdGlwOiBFbW9qaVsndG9vbHRpcCddID0gZmFsc2U7XG4gIEBJbnB1dCgpIHNpemU6IEVtb2ppWydzaXplJ10gPSAyNDtcbiAgQElucHV0KCkgZW1vamk6IEVtb2ppWydlbW9qaSddID0gJyc7XG4gIEBJbnB1dCgpIGZhbGxiYWNrPzogRW1vamlbJ2ZhbGxiYWNrJ107XG4gIEBJbnB1dCgpIGhpZGVPYnNvbGV0ZSA9IGZhbHNlO1xuICBASW5wdXQoKSBzaGVldFJvd3M/OiBudW1iZXI7XG4gIEBJbnB1dCgpIHNoZWV0Q29sdW1ucz86IG51bWJlcjtcbiAgQElucHV0KCkgdXNlQnV0dG9uPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIE5vdGU6IGBlbW9qaU92ZXJgIGFuZCBgZW1vamlPdmVyT3V0c2lkZUFuZ3VsYXJgIGFyZSBkaXNwYXRjaGVkIG9uIHRoZSBzYW1lIGV2ZW50IChgbW91c2VlbnRlcmApLCBidXRcbiAgICogICAgICAgZm9yIGRpZmZlcmVudCBwdXJwb3Nlcy4gVGhlIGBlbW9qaU92ZXJPdXRzaWRlQW5ndWxhcmAgZXZlbnQgaXMgbGlzdGVuZWQgb25seSBpbiBgZW1vamktY2F0ZWdvcnlgXG4gICAqICAgICAgIGNvbXBvbmVudCBhbmQgdGhlIGNhdGVnb3J5IGNvbXBvbmVudCBkb2Vzbid0IGNhcmUgYWJvdXQgem9uZSBjb250ZXh0IHRoZSBjYWxsYmFjayBpcyBiZWluZyBjYWxsZWQgaW4uXG4gICAqICAgICAgIFRoZSBgZW1vamlPdmVyYCBpcyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgaWYgYW55b25lIGlzIGxpc3RlbmluZyB0byB0aGlzIGV2ZW50IGV4cGxpY2l0bHkgaW4gdGhlaXIgY29kZS5cbiAgICovXG4gIEBPdXRwdXQoKSBlbW9qaU92ZXI6IEVtb2ppWydlbW9qaU92ZXInXSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGVtb2ppT3Zlck91dHNpZGVBbmd1bGFyOiBFbW9qaVsnZW1vamlPdmVyJ10gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIC8qKiBTZWUgY29tbWVudHMgYWJvdmUsIHRoaXMgc2VydmVzIHRoZSBzYW1lIHB1cnBvc2UuICovXG4gIEBPdXRwdXQoKSBlbW9qaUxlYXZlOiBFbW9qaVsnZW1vamlMZWF2ZSddID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgZW1vamlMZWF2ZU91dHNpZGVBbmd1bGFyOiBFbW9qaVsnZW1vamlMZWF2ZSddID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgZW1vamlDbGljazogRW1vamlbJ2Vtb2ppQ2xpY2snXSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGVtb2ppQ2xpY2tPdXRzaWRlQW5ndWxhcjogRW1vamlbJ2Vtb2ppQ2xpY2snXSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBzdHlsZTogYW55O1xuICB0aXRsZT86IHN0cmluZyA9IHVuZGVmaW5lZDtcbiAgbGFiZWwgPSAnJztcbiAgdW5pZmllZD86IHN0cmluZyB8IG51bGw7XG4gIGN1c3RvbSA9IGZhbHNlO1xuICBpc1Zpc2libGUgPSB0cnVlO1xuICAvLyBUT0RPOiByZXBsYWNlIDQuMC4zIHcvIGR5bmFtaWMgZ2V0IHZlcmlzb24gZnJvbSBlbW9qaS1kYXRhc291cmNlIGluIHBhY2thZ2UuanNvblxuICBASW5wdXQoKSBiYWNrZ3JvdW5kSW1hZ2VGbjogRW1vamlbJ2JhY2tncm91bmRJbWFnZUZuJ10gPSBERUZBVUxUX0JBQ0tHUk9VTkRGTjtcbiAgQElucHV0KCkgaW1hZ2VVcmxGbj86IEVtb2ppWydpbWFnZVVybEZuJ107XG5cbiAgQFZpZXdDaGlsZCgnYnV0dG9uJywgeyBzdGF0aWM6IGZhbHNlIH0pXG4gIHNldCBidXR0b24oYnV0dG9uOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IHVuZGVmaW5lZCkge1xuICAgIC8vIE5vdGU6IGBydW5PdXRzaWRlQW5ndWxhcmAgaXMgdXNlZCB0byB0cmlnZ2VyIGBhZGRFdmVudExpc3RlbmVyYCBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmVcbiAgICAvLyAgICAgICB0b28uIFNlZSBgc2V0dXBNb3VzZUVudGVyTGlzdGVuZXJgLiBUaGUgYHN3aXRjaE1hcGAgd2lsbCBzdWJzY3JpYmUgdG8gYGZyb21FdmVudGAgY29uc2lkZXJpbmdcbiAgICAvLyAgICAgICB0aGUgY29udGV4dCB3aGVyZSB0aGUgZmFjdG9yeSBpcyBjYWxsZWQgaW4uXG4gICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gdGhpcy5idXR0b24kLm5leHQoYnV0dG9uPy5uYXRpdmVFbGVtZW50KSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHN1YmplY3QgdXNlZCB0byBlbWl0IHdoZW5ldmVyIHZpZXcgcXVlcmllcyBhcmUgcnVuIGFuZCBgYnV0dG9uYCBvciBgc3BhbmAgaXMgc2V0L3JlbW92ZWQuXG4gICAqIFdlIHVzZSBzdWJqZWN0IHRvIGtlZXAgdGhlIHJlYWN0aXZlIGJlaGF2aW9yIHNvIHdlIGRvbid0IGhhdmUgdG8gYWRkIGFuZCByZW1vdmUgZXZlbnQgbGlzdGVuZXJzIG1hbnVhbGx5LlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBidXR0b24kID0gbmV3IFN1YmplY3Q8SFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ+KCk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkZXN0cm95JCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBuZ1pvbmUgPSBpbmplY3QoTmdab25lKTtcbiAgcHJpdmF0ZSByZWFkb25seSBlbW9qaVNlcnZpY2UgPSBpbmplY3QoRW1vamlTZXJ2aWNlKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNldHVwTW91c2VMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKCkge1xuICAgIGlmICghdGhpcy5lbW9qaSkge1xuICAgICAgcmV0dXJuICh0aGlzLmlzVmlzaWJsZSA9IGZhbHNlKTtcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0RGF0YSgpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgcmV0dXJuICh0aGlzLmlzVmlzaWJsZSA9IGZhbHNlKTtcbiAgICB9XG4gICAgLy8gY29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuO1xuICAgIHRoaXMudW5pZmllZCA9IGRhdGEubmF0aXZlIHx8IG51bGw7XG4gICAgaWYgKGRhdGEuY3VzdG9tKSB7XG4gICAgICB0aGlzLmN1c3RvbSA9IGRhdGEuY3VzdG9tO1xuICAgIH1cbiAgICBpZiAoIWRhdGEudW5pZmllZCAmJiAhZGF0YS5jdXN0b20pIHtcbiAgICAgIHJldHVybiAodGhpcy5pc1Zpc2libGUgPSBmYWxzZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRvb2x0aXApIHtcbiAgICAgIHRoaXMudGl0bGUgPSBkYXRhLnNob3J0TmFtZXNbMF07XG4gICAgfVxuICAgIGlmIChkYXRhLm9ic29sZXRlZEJ5ICYmIHRoaXMuaGlkZU9ic29sZXRlKSB7XG4gICAgICByZXR1cm4gKHRoaXMuaXNWaXNpYmxlID0gZmFsc2UpO1xuICAgIH1cblxuICAgIHRoaXMubGFiZWwgPSBbZGF0YS5uYXRpdmVdLmNvbmNhdChkYXRhLnNob3J0TmFtZXMpLmZpbHRlcihCb29sZWFuKS5qb2luKCcsICcpO1xuXG4gICAgaWYgKHRoaXMuaXNOYXRpdmUgJiYgZGF0YS51bmlmaWVkICYmIGRhdGEubmF0aXZlKSB7XG4gICAgICAvLyBoaWRlIG9sZGVyIGVtb2ppIGJlZm9yZSB0aGUgc3BsaXQgaW50byBnZW5kZXJlZCBlbW9qaVxuICAgICAgdGhpcy5zdHlsZSA9IHsgZm9udFNpemU6IGAke3RoaXMuc2l6ZX1weGAgfTtcblxuICAgICAgaWYgKHRoaXMuZm9yY2VTaXplKSB7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gYCR7dGhpcy5zaXplfXB4YDtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLnNpemV9cHhgO1xuICAgICAgICB0aGlzLnN0eWxlWyd3b3JkLWJyZWFrJ10gPSAna2VlcC1hbGwnO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZGF0YS5jdXN0b20pIHtcbiAgICAgIHRoaXMuc3R5bGUgPSB7XG4gICAgICAgIHdpZHRoOiBgJHt0aGlzLnNpemV9cHhgLFxuICAgICAgICBoZWlnaHQ6IGAke3RoaXMuc2l6ZX1weGAsXG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgfTtcbiAgICAgIGlmIChkYXRhLnNwcml0ZVVybCAmJiB0aGlzLnNoZWV0Um93cyAmJiB0aGlzLnNoZWV0Q29sdW1ucykge1xuICAgICAgICB0aGlzLnN0eWxlID0ge1xuICAgICAgICAgIC4uLnRoaXMuc3R5bGUsXG4gICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBgdXJsKCR7ZGF0YS5zcHJpdGVVcmx9KWAsXG4gICAgICAgICAgYmFja2dyb3VuZFNpemU6IGAkezEwMCAqIHRoaXMuc2hlZXRDb2x1bW5zfSUgJHsxMDAgKiB0aGlzLnNoZWV0Um93c30lYCxcbiAgICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb246IHRoaXMuZW1vamlTZXJ2aWNlLmdldFNwcml0ZVBvc2l0aW9uKGRhdGEuc2hlZXQsIHRoaXMuc2hlZXRDb2x1bW5zKSxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc3R5bGUgPSB7XG4gICAgICAgICAgLi4udGhpcy5zdHlsZSxcbiAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGB1cmwoJHtkYXRhLmltYWdlVXJsfSlgLFxuICAgICAgICAgIGJhY2tncm91bmRTaXplOiAnY29udGFpbicsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChkYXRhLmhpZGRlbi5sZW5ndGggJiYgZGF0YS5oaWRkZW4uaW5jbHVkZXModGhpcy5zZXQpKSB7XG4gICAgICAgIGlmICh0aGlzLmZhbGxiYWNrKSB7XG4gICAgICAgICAgdGhpcy5zdHlsZSA9IHsgZm9udFNpemU6IGAke3RoaXMuc2l6ZX1weGAgfTtcbiAgICAgICAgICB0aGlzLnVuaWZpZWQgPSB0aGlzLmZhbGxiYWNrKGRhdGEsIHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAodGhpcy5pc1Zpc2libGUgPSBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc3R5bGUgPSB0aGlzLmVtb2ppU2VydmljZS5lbW9qaVNwcml0ZVN0eWxlcyhcbiAgICAgICAgICBkYXRhLnNoZWV0LFxuICAgICAgICAgIHRoaXMuc2V0LFxuICAgICAgICAgIHRoaXMuc2l6ZSxcbiAgICAgICAgICB0aGlzLnNoZWV0U2l6ZSxcbiAgICAgICAgICB0aGlzLnNoZWV0Um93cyxcbiAgICAgICAgICB0aGlzLmJhY2tncm91bmRJbWFnZUZuLFxuICAgICAgICAgIHRoaXMuc2hlZXRDb2x1bW5zLFxuICAgICAgICAgIHRoaXMuaW1hZ2VVcmxGbj8uKHRoaXMuZ2V0RGF0YSgpKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICh0aGlzLmlzVmlzaWJsZSA9IHRydWUpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95JC5uZXh0KCk7XG4gIH1cblxuICBnZXREYXRhKCkge1xuICAgIHJldHVybiB0aGlzLmVtb2ppU2VydmljZS5nZXREYXRhKHRoaXMuZW1vamksIHRoaXMuc2tpbiwgdGhpcy5zZXQpO1xuICB9XG5cbiAgZ2V0U2FuaXRpemVkRGF0YSgpOiBFbW9qaURhdGEge1xuICAgIHJldHVybiB0aGlzLmVtb2ppU2VydmljZS5nZXRTYW5pdGl6ZWREYXRhKHRoaXMuZW1vamksIHRoaXMuc2tpbiwgdGhpcy5zZXQpIGFzIEVtb2ppRGF0YTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBNb3VzZUxpc3RlbmVycygpOiB2b2lkIHtcbiAgICBjb25zdCBldmVudExpc3RlbmVyJCA9IChldmVudE5hbWU6IHN0cmluZykgPT5cbiAgICAgIHRoaXMuYnV0dG9uJC5waXBlKFxuICAgICAgICAvLyBOb3RlOiBgRU1QVFlgIGlzIHVzZWQgdG8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVyIG9uY2UgdGhlIERPTSBub2RlIGlzIHJlbW92ZWQuXG4gICAgICAgIHN3aXRjaE1hcChidXR0b24gPT4gKGJ1dHRvbiA/IGZyb21FdmVudChidXR0b24sIGV2ZW50TmFtZSkgOiBFTVBUWSkpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5kZXN0cm95JCksXG4gICAgICApO1xuXG4gICAgZXZlbnRMaXN0ZW5lciQoJ2NsaWNrJykuc3Vic2NyaWJlKCRldmVudCA9PiB7XG4gICAgICBjb25zdCBlbW9qaSA9IHRoaXMuZ2V0U2FuaXRpemVkRGF0YSgpO1xuICAgICAgdGhpcy5lbW9qaUNsaWNrT3V0c2lkZUFuZ3VsYXIuZW1pdCh7IGVtb2ppLCAkZXZlbnQgfSk7XG4gICAgICAvLyBOb3RlOiB0aGlzIGlzIGRvbmUgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LiBXZSBydW4gY2hhbmdlIGRldGVjdGlvbiBpZiBkZXZlbG9wZXJzXG4gICAgICAvLyAgICAgICBhcmUgbGlzdGVuaW5nIHRvIGBlbW9qaUNsaWNrYCBpbiB0aGVpciBjb2RlLiBGb3IgaW5zdGFuY2U6XG4gICAgICAvLyAgICAgICBgPG5neC1lbW9qaSAoZW1vamlDbGljayk9XCIuLi5cIj48L25neC1lbW9qaT5gLlxuICAgICAgaWYgKHRoaXMuZW1vamlDbGljay5vYnNlcnZlZCkge1xuICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gdGhpcy5lbW9qaUNsaWNrLmVtaXQoeyBlbW9qaSwgJGV2ZW50IH0pKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGV2ZW50TGlzdGVuZXIkKCdtb3VzZWVudGVyJykuc3Vic2NyaWJlKCRldmVudCA9PiB7XG4gICAgICBjb25zdCBlbW9qaSA9IHRoaXMuZ2V0U2FuaXRpemVkRGF0YSgpO1xuICAgICAgdGhpcy5lbW9qaU92ZXJPdXRzaWRlQW5ndWxhci5lbWl0KHsgZW1vamksICRldmVudCB9KTtcbiAgICAgIC8vIE5vdGU6IHRoaXMgaXMgZG9uZSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuIFdlIHJ1biBjaGFuZ2UgZGV0ZWN0aW9uIGlmIGRldmVsb3BlcnNcbiAgICAgIC8vICAgICAgIGFyZSBsaXN0ZW5pbmcgdG8gYGVtb2ppT3ZlcmAgaW4gdGhlaXIgY29kZS4gRm9yIGluc3RhbmNlOlxuICAgICAgLy8gICAgICAgYDxuZ3gtZW1vamkgKGVtb2ppT3Zlcik9XCIuLi5cIj48L25neC1lbW9qaT5gLlxuICAgICAgaWYgKHRoaXMuZW1vamlPdmVyLm9ic2VydmVkKSB7XG4gICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB0aGlzLmVtb2ppT3Zlci5lbWl0KHsgZW1vamksICRldmVudCB9KSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBldmVudExpc3RlbmVyJCgnbW91c2VsZWF2ZScpLnN1YnNjcmliZSgkZXZlbnQgPT4ge1xuICAgICAgY29uc3QgZW1vamkgPSB0aGlzLmdldFNhbml0aXplZERhdGEoKTtcbiAgICAgIHRoaXMuZW1vamlMZWF2ZU91dHNpZGVBbmd1bGFyLmVtaXQoeyBlbW9qaSwgJGV2ZW50IH0pO1xuICAgICAgLy8gTm90ZTogdGhpcyBpcyBkb25lIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS4gV2UgcnVuIGNoYW5nZSBkZXRlY3Rpb24gaWYgZGV2ZWxvcGVyc1xuICAgICAgLy8gICAgICAgYXJlIGxpc3RlbmluZyB0byBgZW1vamlMZWF2ZWAgaW4gdGhlaXIgY29kZS4gRm9yIGluc3RhbmNlOlxuICAgICAgLy8gICAgICAgYDxuZ3gtZW1vamkgKGVtb2ppTGVhdmUpPVwiLi4uXCI+PC9uZ3gtZW1vamk+YC5cbiAgICAgIGlmICh0aGlzLmVtb2ppTGVhdmUub2JzZXJ2ZWQpIHtcbiAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHRoaXMuZW1vamlMZWF2ZS5lbWl0KHsgZW1vamksICRldmVudCB9KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
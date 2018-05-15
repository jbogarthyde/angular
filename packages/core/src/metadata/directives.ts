/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy} from '../change_detection/constants';
import {Provider} from '../di';
import {R3_COMPILE_COMPONENT, R3_COMPILE_DIRECTIVE} from '../ivy_switch';
import {Type} from '../type';
import {TypeDecorator, makeDecorator, makePropDecorator} from '../util/decorators';
import {ViewEncapsulation} from './view';


/**
 * Supplies configuration metadata for an Angular directive.
 *
 * @usageNotes
 *
 * To define your own directive, import the decorator
 * and use it to annotate your directive class. The
 * metadata must include a `selector` that you use to
 * reference your directive class from a template.
 *
 * ```
 * import {Directive} from '@angular/core';
 *
 * @Directive({
 *   selector: 'my-directive',
 * })
 * export class MyDirective {
 * }
 * ```
 *
 * The following simple example assigns a directive to a variable
 * in a template:
 *
 * ```
 * @Directive({
 *   selector: 'child-dir',
 *   exportAs: 'child'
 * })
 * class ChildDir {
 * }
 *
 * @Component({
 *   selector: 'main',
 *   template: `<child-dir #c="child"></child-dir>`
 * })
 * class MainComponent {
 * }
 *
 * ```
 * ### Configuring host mappings
 *
 * The following example shows how to map an event to an action.
 * It declares a directive that attaches a click listener to
 * a button and counts clicks.
 *
 * ```typescript
 * @Directive({
 *   selector: 'button[counting]',
 *   host: {
 *     '(click)': 'onClick($event.target)'
 *   }
 * })
 * class CountClicks {
 *   numberOfClicks = 0;
 *
 *   onClick(btn) {
 *     console.log("button", btn, "number of clicks:", this.numberOfClicks++);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<button counting>Increment</button>`
 * })
 * class App {}
 * ```
 * See [live demo](http://plnkr.co/edit/DlA5KU?p=preview)
 *
 * The following example creates a directive that maps a host class to a DOM
 * element, setting the `valid` and `invalid` properties
 * on the DOM element that has the `ngModel` directive on it.
 *
 * ```typescript
 * @Directive({
 *   selector: '[ngModel]',
 *   host: {
 *     '[class.valid]': 'valid',
 *     '[class.invalid]': 'invalid'
 *   }
 * })
 * class NgModelStatus {
 *   constructor(public control:NgModel) {}
 *   get valid { return this.control.valid; }
 *   get invalid { return this.control.invalid; }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<input [(ngModel)]="prop">`
 * })
 * class App {
 *   prop;
 * }
 * ```
 * See [live demo](http://plnkr.co/edit/gNg0ED?p=preview).
 *
 * The following example shows how to specify static attributes
 * that should be propagated to a host element.
 *
 * ```typescript
 * @Directive({
 *   selector: '[my-button]',
 *   host: {
 *     'role': 'button'
 *   }
 * })
 * class MyButton {
 * }
 * ```
 * Attaching the `my-button` directive to the host `<div>` element
 * ensures that this element gets the "button" role.
 *
 * ```html
 * <div my-button></div>
 * ```
 *
 * ### DI providers
 *
 * The following simple example shows how a class is injected,
 * using a provider specified in the directive metadata:
 *
 * ```
 * class Greeter {
 *    greet(name:string) {
 *      return 'Hello ' + name + '!';
 *    }
 * }
 *
 * @Directive({
 *   selector: 'greet',
 *   providers: [
 *     Greeter
 *   ]
 * })
 * class HelloWorld {
 *   greeter:Greeter;
 *
 *   constructor(greeter:Greeter) {
 *     this.greeter = greeter;
 *   }
 * }
 * ```
 *
 * ### Configuring queries
 *
 * The followoing example (shows what??)
 * ```
 * @Component({
 *   selector: 'someDir',
 *   queries: {
 *     contentChildren: new ContentChildren(ChildDirective),
 *     viewChildren: new ViewChildren(ChildDirective)
 *   },
 *   template: '<child-directive></child-directive>'
 * })
 * class SomeDir {
 *   contentChildren: QueryList<ChildDirective>,
 *   viewChildren: QueryList<ChildDirective>
 *
 *   ngAfterContentInit() {
 *     // contentChildren is set
 *   }
 *
 *   ngAfterViewInit() {
 *     // viewChildren is set
 *   }
 * }
 * ```
 *
 */
export interface DirectiveDecorator {
  /**
   * Directives allow you to attach behavior to elements in the DOM.
   * Directive metadata determines how the directive should be processed,
   * instantiated, and used at run time.
   *
   * A directive must belong to an NgModule in order for it to be usable
         * by another directive, component, or application.
         * To make a directive a member of anNgModule,
         * list it in the `declarations` field of the `@NgModule` metadata.
         *
         * Note that, in addition to the metadata options for configuring a directive,
         * you can control a directive's runtime behavior by implementing
         * life-cycle hooks. For more information, see the
         * [Lifecycle Hooks](guide/lifecycle-hooks) guide.
         *
   * @Annotation
   */
  (obj: Directive): TypeDecorator;

  /**
   * See the {@link Directive} decorator.
   */
  new (obj: Directive): Directive;
}

/**
 *
 */
export interface Directive {
  /**
   * The CSS selector that identifies this directive in a template
   * and triggers instantiation of the directive.
   *
   * Declare as one of the following:
   *
   * - `element-name`: Select by element name.
   * - `.class`: Select by class name.
   * - `[attribute]`: Select by attribute name.
   * - `[attribute=value]`: Select by attribute name and value.
   * - `:not(sub_selector)`: Select only if the element does not match the `sub_selector`.
   * - `selector1, selector2`: Select if either `selector1` or `selector2` matches.
   *
   * Angular only allows directives to apply on CSS selectors that do not cross
   * element boundaries.
   *
   * For the following template HTML, a directive with an `input[type=text]` selector,
   * would be instantiated only on the `<input type="text">` element.
   *
   * ```html
   * <form>
   *   <input type="text">
   *   <input type="radio">
   * <form>
   * ```
   *
   */
  selector?: string;

  /**
   * The set of data-bound input properties for a directive.
   * Angular automatically updates input properties during change detection.
   *
   * Each input property maps a `directiveProperty` to a `bindingProperty`:
   *
   * - `directiveProperty` specifies the component property where the value is written.
   * - `bindingProperty` specifies the DOM property where the value is read from.
   * When not provided, it is assumed to be the same as `directiveProperty`.
   *
   */
  inputs?: string[];

  /**
   * The set of event-bound output properties.
   * When an output property emits an event, an event handler attached to that event
   * in the template is invoked.
   *
   * Each input property maps a `directiveProperty` to a `bindingProperty`:
   * - `directiveProperty` specifies the component property that emits events.
   * - `bindingProperty` specifies the DOM property the event handler is attached to.
   *
   */
  outputs?: string[];

  /**
   * Maps class properties to host element bindings for properties,
   * attributes, and events, using a set of key-value pairs.
   *
   * Angular automatically checks host property bindings during change detection.
   * If a binding changes, Angular updates the directive's host element.
   *
   * When the key is a property of the host element, the property value is
   * the propagated to the specified DOM property.
   *
   * When the key is a static attribute in the DOM, the attribute value
   * is propagated to the specified property in the host element.
   *
   * For event handling:
   * - The key is the DOM event that the directive listens to.
   * To listen to global events, add the target to the event name.
   * The target can be `window`, `document` or `body`.
   * - The value is the statement to execute when the event occurs. If the
   * statement evalueates to `false`, then `preventDefault`is applied on the DOM
   * event. A handler method can refer to the `$event` local variable.
   *
   */
  host?: {[key: string]: string};

  /**
   * The set of injectable objects that are visible to the directive and its light DOM
   * children.
   *
   */
  providers?: Provider[];

  /**
   * The name or names that can be used in the template to assign this directive to a variable.
   * For multiple names, use a comma-separated string.
   *
   */
  exportAs?: string;

  /**
   * Configures the queries that will be injected into the directive.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   */
  queries?: {[key: string]: any};
}

/**
 * Marks a class as a directive and provides configuration metadata.
 *
 *
 * @Annotation
 */
export const Directive: DirectiveDecorator = makeDecorator(
    'Directive', (dir: Directive = {}) => dir, undefined, undefined,
    (type: Type<any>, meta: Directive) => (R3_COMPILE_DIRECTIVE || (() => {}))(type, meta));

/**
 * Marks a class as a component and provides configuration and constructor metadata.
 *
 * @usageNotes
 *
 * ### Setting component inputs
 *
 * The following example creates a component with two data-bound properties,
 * specified by the `inputs` value.
 *
 * ```typescript
 * @Component({
 *   selector: 'bank-account',
 *   inputs: ['bankName', 'id: account-id'],
 *   template: `
 *     Bank Name: {{bankName}}
 *     Account Id: {{id}}
 *   `
 * })
 * class BankAccount {
 *   bankName: string;
 *   id: string;
 *
 *   // this property is not bound, and won't be automatically updated by Angular
 *   normalizedBankName: string;
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <bank-account bankName="RBC" account-id="4747"></bank-account>
 *   `
 * })
 * class App {}
 * ```
 See [live demo](http://plnkr.co/edit/ivhfXY?p=preview).
 *
 * ### Setting component outputs
 *
 * The following example
 *
 * ```typescript
 * @Directive({
 *   selector: 'interval-dir',
 *   outputs: ['everySecond', 'five5Secs: everyFiveSeconds']
 * })
 * class IntervalDir {
 *   everySecond = new EventEmitter();
 *   five5Secs = new EventEmitter();
 *
 *   constructor() {
 *     setInterval(() => this.everySecond.emit("event"), 1000);
 *     setInterval(() => this.five5Secs.emit("event"), 5000);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <interval-dir (everySecond)="everySecond()" (everyFiveSeconds)="everyFiveSeconds()">
 *     </interval-dir>
 *   `
 * })
 * class App {
 *   everySecond() { console.log('second'); }
 *   everyFiveSeconds() { console.log('five seconds'); }
 * }
 * ```
 * See [live demo](http://plnkr.co/edit/d5CNq7?p=preview)
 *
 *
 */
export interface ComponentDecorator {
  /**
   * Marks a class as an Angular component and collects component configuration
   * metadata that determines how the component should be processed,
   * instantiated, and used at runtime.
   *
   * Components are the most basic UI building block of an Angular app.
   * An Angular app contains a tree of Angular components.
   *
   * Angular components are a subset of directives, always associated with a template.
   * Unlike other directives, only one component can be instantiated per an element in a template.
   *
   * A component must belong to an NgModule in order for it to be usable
   * by another component or application. To make it a member of an NgModule,
   * list it in the `declarations` field of the `@NgModule` metadata.
   *
   * Note that, in addition to these options for configuring a directive,
   * you can control a directive's runtime behavior by implementing
   * life-cycle hooks. For more information, see the
   * [Livecycle Hooks](guide/lifecycle-hooks) guide.
   *
   * @usageNotes
   *
   * {@example core/ts/metadata/metadata.ts region='component'}
   *
   *
   * @Annotation
   */
  (obj: Component): TypeDecorator;
  /**
   * See the `@Component` decorator.
   */
  new (obj: Component): Component;
}

/**
 * Supplies configuration metadata for an Angular component.
 *
 * @usageNotes
 *
 * ### Injecting a class with a view provider
 *
 * The following simple example injects a class into a component
 * using the view provider specified in component metadata:
 *
 * ```
 * class Greeter {
 *    greet(name:string) {
 *      return 'Hello ' + name + '!';
 *    }
 * }
 *
 * @Directive({
 *   selector: 'needs-greeter'
 * })
 * class NeedsGreeter {
 *   greeter:Greeter;
 *
 *   constructor(greeter:Greeter) {
 *     this.greeter = greeter;
 *   }
 * }
 *
 * @Component({
 *   selector: 'greet',
 *   viewProviders: [
 *     Greeter
 *   ],
 *   template: `<needs-greeter></needs-greeter>`
 * })
 * class HelloWorld {
 * }
 *
 * ```
 *
 *
 */
export interface Component extends Directive {
  /**
   * Defines the used change detection strategy.
   *
   * When a component is instantiated, Angular creates a change detector, which is responsible for
   * propagating the component's bindings.
   *
   * The `changeDetection` property defines, whether the change detection will be checked every time
   * or only when the component tells it to do so.
   */
  changeDetection?: ChangeDetectionStrategy;

  /**
   * Defines the set of injectable objects that are visible to its view DOM children.
   *
   */
  viewProviders?: Provider[];

  /**
   * The module ID of the module that contains the component.
   * The component must be able to resolve relative URLs for templates and styles.
   * In CommonJS, this can  be set to `module.id`. Similarly, SystemJS exposes the
   * `__moduleName` variable within each module.
   *
   * For example:
   *
   * ```
   * @Directive({
   *   selector: 'someDir',
   *   moduleId: module.id
   * })
   * class SomeDir {
   * }
   * ```
   */
  moduleId?: string;

  /**
   * The URL of a template file for an Angular component. If provided,
   * do not supply an inline template using `template`.
   *
   */
  templateUrl?: string;

  /**
   * An inline template for an Angular component. If provided,
   * do not supply a template file using `templateUrl`.
   *
   */
  template?: string;

  /**
   * One or more URLs for files containing CSS stylesheets to use
   * in this component.
   */
  styleUrls?: string[];

  /**
   * One or more inline CSS stylesheets to use
   * in this component.
   */
  styles?: string[];

  /**
   * One or more animation `trigger()` calls, containing
   * `state()` and `transition()` definitions.
   * See the [Animations guide](/guide/animations) and animations API documentation.
   *
   */
  animations?: any[];

  /**
   * An encapsulation policy for the template and CSS styles. One of:
   * - `ViewEncapsulation.Native`: Use shadow roots. This works
   * only if natively available on the platform.
   * - `ViewEncapsulation.Emulated`: Use shimmed CSS that
   * emulates the native behavior.
   * - `ViewEncapsulation.None`: Use global CSS without any
   * encapsulation.
   *
   * If not supplied, the value is taken from `CompilerOptions`. The default compiler option is
   * `ViewEncapsulation.Emulated`.
   *
   * If the policy is set to `ViewEncapsulation.Emulated` and the component has no `styles`
   * or `styleUrls` specified, the policy is automatically switched to `ViewEncapsulation.None`.
   */
  encapsulation?: ViewEncapsulation;

  /**
   * Overrides the default encapsulation start and end delimiters (`{{` and `}}`)
   */
  interpolation?: [string, string];

  /**
   * A set of components that should be compiled along with
   * this component. For each component listed here,
   * Angular creates a {@link ComponentFactory} and stores it in the
   * {@link ComponentFactoryResolver}.
   */
  entryComponents?: Array<Type<any>|any[]>;

  /**
   * True to preserve or false to remove potentially superfluous whitespace characters
   * from the compiled template. Whitespace characters are those matching the `\s`
   * character class in JavaScript regular expressions. Default is false, unless
   * overridden in compiler options.
   */
  preserveWhitespaces?: boolean;
}

/**
 * Component decorator and metadata.
 *
 * @usageNotes
 *
 * ### Using animations
 *
 * The following snippet shows an animation trigger in a component's
 * metadata. The trigger is attached to an element in the component's
 * template, using "@_trigger_name_", and a state expression that is evaluated
 * at run time to determine whether the animation should start.
 *
 * ```typescript
 * @Component({
 *   selector: 'animation-cmp',
 *   templateUrl: 'animation-cmp.html',
 *   animations: [
 *     trigger('myTriggerName', [
 *       state('on', style({ opacity: 1 }),
 *       state('off', style({ opacity: 0 }),
 *       transition('on => off', [
 *         animate("1s")
 *       ])
 *     ])
 *   ]
 * })
 * ```
 *
 * ```html
 * <!-- animation-cmp.html -->
 * <div @myTriggerName="expression">...</div>
 * ```
 *
 * ### Preserving whitespace
 *
 * Removing whitespace can greatly reduce AOT-generated code size, and speed up view creation.
 * As of Angular 6, default for `preserveWhitespaces` is false (whitespace is removed).
 * To change the default setting for all components in your application, set
 * the `preserveWhitespaces` option of the AOT compiler.
 *
 * Current implementation removes whitespace characters as follows:
 * - Trims all whitespaces at the beginning and the end of a template.
 * - Removes whitespace-only text nodes. For example,
 * `<button>Action 1</button>  <button>Action 2</button>` becomes
 * `<button>Action 1</button><button>Action 2</button>`.
 * - Replaces a series of whitespace characters in text nodes with a single space.
 * For example, `<span>\n some text\n</span>` becomes `<span> some text </span>`.
 * - Does NOT alter text nodes inside HTML tags such as `<pre>` or `<textarea>`,
 * where whitespace characters are significant.
 *
 * Note that these transformations can influence DOM nodes layout, although impact
 * should be minimal.
 *
 * You can override the default behavior to preserve whitespace characters
 * in certain fragments of a template. For example, you can exclude an entire
 * DOM sub-tree by using the`ngPreserveWhitespaces` attribute:
 *
 * ```html
 * <div ngPreserveWhitespaces>
 *     whitespaces are preserved here
 *     <span>    and here </span>
 * </div>
 * ```
 *
 * You can force a single space to be preserved in a text node by using `&ngsp;`,
 * which is replaced with a space character by Angular's template
 * compiler:
 *
 * ```html
 * <a>Spaces</a>&ngsp;<a>between</a>&ngsp;<a>links.</a>
 * <!-->compiled to be equivalent to:</>
 *  <a>Spaces</a> <a>between</a> <a>links.</a>
 * ```
 *
 * Note that sequences of `&ngsp;` are still collapsed to just one space character when
 * the `preserveWhitespaces` option is set to `false`.
 *
 * ```html
 * <a>before</a>&ngsp;&ngsp;&ngsp;<a>after</a>
 * <!-->compiled to be equivalent to:</>
 *  <a>Spaces</a> <a>between</a> <a>links.</a>
 * ```
 *
 * To preserve sequences of whitespace characters, use the
 * `ngPreserveWhitespaces` attribute.
 *
 * @Annotation
 */
export const Component: ComponentDecorator = makeDecorator(
    'Component', (c: Component = {}) => ({changeDetection: ChangeDetectionStrategy.Default, ...c}),
    Directive, undefined,
    (type: Type<any>, meta: Component) => (R3_COMPILE_COMPONENT || (() => {}))(type, meta));

/**
 * Type of the Pipe decorator / constructor function.
 *
 *
 */
export interface PipeDecorator {
  /**
   * Declare reusable pipe function.
   *
   * A "pure" pipe is only re-evaluated when either the input or any of the arguments change.
   *
   * When not specified, pipes default to being pure.
   */
  (obj: Pipe): TypeDecorator;

  /**
   * See the {@link Pipe} decorator.
   */
  new (obj: Pipe): Pipe;
}

/**
 * Type of the Pipe metadata.
 *
 *
 */
export interface Pipe {
  /**
   * Name of the pipe.
   *
   * The pipe name is used in template bindings. For example if a pipe is named
   * `myPipe` then it would be used in the template binding expression like
   * so:  `{{ exp | myPipe }}`.
   */
  name: string;

  /**
   * If Pipe is pure (its output depends only on its input.)
   *
   * Normally pipe's `transform` method is only invoked when the inputs to pipe`s
   * `transform` method change. If the pipe has internal state (it's result are
   * dependent on state other than its arguments) than set `pure` to `false` so
   * that the pipe is invoked on each change-detection even if the arguments to the
   * pipe do not change.
   */
  pure?: boolean;
}

/**
 * Pipe decorator and metadata.
 *
 * Use the `@Pipe` annotation to declare that a given class is a pipe. A pipe
 * class must also implement {@link PipeTransform} interface.
 *
 * To use the pipe include a reference to the pipe class in
 * {@link NgModule#declarations}.
 *
 *
 * @Annotation
 */
export const Pipe: PipeDecorator = makeDecorator('Pipe', (p: Pipe) => ({pure: true, ...p}));


/**
 * Type of the Input decorator / constructor function.
 *
 *
 */
export interface InputDecorator {
  /**
   * Declares a data-bound input property.
   *
   * Angular automatically updates data-bound properties during change detection.
   *
   * `Input` takes an optional parameter that specifies the name
   * used when instantiating a component in the template. When not provided,
   * the name of the decorated property is used.
   *
   * ### Example
   *
   * The following example creates a component with two input properties.
   *
   * ```typescript
   * @Component({
   *   selector: 'bank-account',
   *   template: `
   *     Bank Name: {{bankName}}
   *     Account Id: {{id}}
   *   `
   * })
   * class BankAccount {
   *   @Input() bankName: string;
   *   @Input('account-id') id: string;
   *
   *   // this property is not bound, and won't be automatically updated by Angular
   *   normalizedBankName: string;
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `
   *     <bank-account bankName="RBC" account-id="4747"></bank-account>
   *   `
   * })
   *
   * class App {}
   * ```
   *
   */
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * Type of the Input metadata.
 *
 *
 */
export interface Input {
  /**
   * Name used when instantiating a component in the template.
   */
  bindingPropertyName?: string;
}

/**
 * Input decorator and metadata.
 *
 *
 * @Annotation
 */
export const Input: InputDecorator =
    makePropDecorator('Input', (bindingPropertyName?: string) => ({bindingPropertyName}));

/**
 * Type of the Output decorator / constructor function.
 *
 *
 */
export interface OutputDecorator {
  /**
   * Declares an event-bound output property.
   *
   * When an output property emits an event, an event handler attached to that event
   * the template is invoked.
   *
   * `Output` takes an optional parameter that specifies the name
   * used when instantiating a component in the template. When not provided,
   * the name of the decorated property is used.
   *
   * ### Example
   *
   * ```typescript
   * @Directive({
   *   selector: 'interval-dir',
   * })
   * class IntervalDir {
   *   @Output() everySecond = new EventEmitter();
   *   @Output('everyFiveSeconds') five5Secs = new EventEmitter();
   *
   *   constructor() {
   *     setInterval(() => this.everySecond.emit("event"), 1000);
   *     setInterval(() => this.five5Secs.emit("event"), 5000);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `
   *     <interval-dir (everySecond)="everySecond()" (everyFiveSeconds)="everyFiveSeconds()">
   *     </interval-dir>
   *   `
   * })
   * class App {
   *   everySecond() { console.log('second'); }
   *   everyFiveSeconds() { console.log('five seconds'); }
   * }
   * ```
   *
   */
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * Type of the Output metadata.
 *
 *
 */
export interface Output { bindingPropertyName?: string; }

/**
 * Output decorator and metadata.
 *
 *
 * @Annotation
 */
export const Output: OutputDecorator =
    makePropDecorator('Output', (bindingPropertyName?: string) => ({bindingPropertyName}));


/**
 * Type of the HostBinding decorator / constructor function.
 *
 *
 */
export interface HostBindingDecorator {
  /**
   * Declares a host property binding.
   *
   * Angular automatically checks host property bindings during change detection.
   * If a binding changes, it will update the host element of the directive.
   *
   * `HostBinding` takes an optional parameter that specifies the property
   * name of the host element that will be updated. When not provided,
   * the class property name is used.
   *
   * ### Example
   *
   * The following example creates a directive that sets the `valid` and `invalid` classes
   * on the DOM element that has ngModel directive on it.
   *
   * ```typescript
   * @Directive({selector: '[ngModel]'})
   * class NgModelStatus {
   *   constructor(public control:NgModel) {}
   *   @HostBinding('class.valid') get valid() { return this.control.valid; }
   *   @HostBinding('class.invalid') get invalid() { return this.control.invalid; }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `<input [(ngModel)]="prop">`,
   * })
   * class App {
   *   prop;
   * }
   * ```
   *
   */
  (hostPropertyName?: string): any;
  new (hostPropertyName?: string): any;
}

/**
 * Type of the HostBinding metadata.
 *
 *
 */
export interface HostBinding { hostPropertyName?: string; }

/**
 * HostBinding decorator and metadata.
 *
 *
 * @Annotation
 */
export const HostBinding: HostBindingDecorator =
    makePropDecorator('HostBinding', (hostPropertyName?: string) => ({hostPropertyName}));


/**
 * Type of the HostListener decorator / constructor function.
 *
 *
 */
export interface HostListenerDecorator {
  /**
   * Declares a host listener.
   *
   * Angular will invoke the decorated method when the host element emits the specified event.
   *
   * If the decorated method returns `false`, then `preventDefault` is applied on the DOM event.
   *
   * ### Example
   *
   * The following example declares a directive that attaches a click listener to the button and
   * counts clicks.
   *
   * ```typescript
   * @Directive({selector: 'button[counting]'})
   * class CountClicks {
   *   numberOfClicks = 0;
   *
   *   @HostListener('click', ['$event.target'])
   *   onClick(btn) {
   *     console.log('button', btn, 'number of clicks:', this.numberOfClicks++);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: '<button counting>Increment</button>',
   * })
   * class App {}
   * ```
   *
   * @Annotation
   */
  (eventName: string, args?: string[]): any;
  new (eventName: string, args?: string[]): any;
}

/**
 * Type of the HostListener metadata.
 *
 *
 */
export interface HostListener {
  eventName?: string;
  args?: string[];
}

/**
 * HostListener decorator and metadata.
 *
 *
 * @Annotation
 */
export const HostListener: HostListenerDecorator =
    makePropDecorator('HostListener', (eventName?: string, args?: string[]) => ({eventName, args}));

Your structure for `app.component` is common and okay. However, it can be improved based on the purpose you are trying to achieve. Having a `navbar` and `footer` surrounding a `router-outlet` is standard practice in Angular applications.

If you want to have a background image that can be changed dynamically but fixed, it would make sense to make it its own component. This approach is especially beneficial if you have multiple components or routes that will be using this background image. It allows for a cleaner structure and easier maintainability.

For example, your structure can be modified to something like this:

```html
<app-navbar></app-navbar>

<app-background>
    <router-outlet></router-outlet>
</app-background>

<app-footer></app-footer>
```

In this structure, the `app-background` component can have its own CSS and logic to manage the background image. The background can be fixed by setting the CSS property `background-attachment: fixed;`.

Here is an example of what the CSS for the `app-background` component could look like:

```css
.background {
    background-image: url('/path/to/your/image.jpg');
    background-size: cover;
    background-attachment: fixed;
    min-height: 100vh; /* ensure it covers the whole viewport height */
}
```

And in your `app-background` component's HTML:

```html
<div class="background">
    <ng-content></ng-content>
</div>
```

The `<ng-content>` tag is used to project content into the component. This means whatever you put inside the `<app-background>` tags (in this case, the `<router-outlet>`) will be rendered inside that `div`.

This is a more modular approach and follows best practices for component-based architecture. It separates concerns by isolating the background logic into its own component.
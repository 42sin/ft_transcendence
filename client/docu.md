# Useful Angular Guides

[Angular Components Beginner's Guide](https://www.youtube.com/watch?v=23o0evRtrFI)

[Angular Router](https://www.youtube.com/watch?v=Np3ULAMqwNo)

[Angular Forms](https://www.youtube.com/watch?v=JeeUY6WaXiA)

# Styling

[Dropdown Navbar](https://www.w3schools.com/howto/howto_css_dropdown_navbar.asp)

[Centered Top Navigation](https://www.w3schools.com/howto/howto_css_topnav_centered.asp)

## HTML <body><app-root</app-root></body> 

<body>
  <header>
    <img src="logo.gif" alt="logo">
    <h1>Titel</h1>
    <nav>
      <ul>
        <li><a href="#link_1.html">Startseite</a></li>
        <li><a href="#link_2.html">Unterseite 1</a></li>
        <li><a href="#link_3.html">Unterseite 2</a></li>    
        <li><a href="#link_4.html">Kontakt</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <section></section>
  </main>

  <footer>
    <a href="#kontakt.html">Kontakt</a>
    <p>© 2014 by selfHTML</p>
  </footer>
</body>

## Component Structure

```
src/
  app/
    core/
      services/
      guards/
      core.module.ts
    shared/
      components/
      directives/
      pipes/
      shared.module.ts
    features/
      game/
        components/
        services/
        game.module.ts
        game-routing.module.ts
      settings/
        components/
        services/
        settings.module.ts
        settings-routing.module.ts
    app.component.html
    app.component.ts
    app.module.ts
    app-routing.module.ts
  assets/
  environments/
  styles/
  index.html
  main.ts
  ...
```

- Feature Modules (particular features)
- Shared Modules (reusable)
- Core Module (instantiated only once)
- Folders by Feature
- Presentational Components (how things look) vs Container Components (how things work)

## Ideas

- Different Backgrounds
- Different Color Themes/Accents based on Coalition
- Page Transitions

- Somehow I dislike the navigation icons, maybe stay with text..
- Navigation Icons from Canva
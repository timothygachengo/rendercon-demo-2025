# Introduction to Expo Router

_Expo Router is an open-source routing library for Universal React Native applications built with Expo._

Expo Router is a file-based router for React Native and web applications. It allows you to manage navigation between screens in your app, allowing users to move seamlessly between different parts of your app's UI, using the same components on multiple platforms (Android, iOS, and web).

It brings the best file-system routing concepts from the web to a universal application &mdash; allowing your routing to work across every platform. When a file is added to the **app** directory, the file automatically becomes a route in your navigation.

[Expo Router reference](https://docs.expo.dev/versions/latest/sdk/router/)

## Features

- **Native**: Built on top of our powerful [React Navigation suite](https://reactnavigation.org/), Expo Router navigation is truly native and platform-optimized by default.
- **Shareable**: Every screen in your app is automatically deep linkable. Making any route in your app shareable with links.
- **Offline-first**: Apps are cached and run offline-first, with automatic updates when you publish a new version. Handles all incoming native URLs without a network connection or server.
- **Optimized**: Routes are automatically optimized with lazy-evaluation in production, and deferred bundling in development.
- **Iteration**: Universal Fast Refresh across Android, iOS, and web, along with artifact memoization in the bundler to keep you moving fast at scale.
- **Universal**: Android, iOS, and web share a unified navigation structure, with the ability to drop-down to platform-specific APIs at the route level.
- **Discoverable**: Expo Router enables build-time static rendering on web, and universal linking to native. Meaning your app content can be indexed by search engines.

### Using a different navigation library

You can use any other navigation library, like [React Navigation](https://reactnavigation.org/docs/getting-started#installation), in your Expo project. However, if you are building a new app, **we recommend using Expo Router for all the features described above**. With other navigation libraries, you might have to implement your own strategies for some of these features, such as shareable links or handling web and native navigation in the same project.

If you are looking to use [React Native Navigation by Wix](https://github.com/wix/react-native-navigation), it is not available in Expo Go and is not yet compatible with `expo-dev-client`. We recommend using [`createNativeStackNavigator`](https://reactnavigation.org/docs/native-stack-navigator) from React Navigation to use Android and iOS native navigation APIs.

## Common questions

#### Expo Router versus Expo versus React Native CLI

Historically, React Native has been non prescriptive about how apps should be built which is similar to using React without a modern web framework. Expo Router is an opinionated framework for React Native, similar to how Remix and Next.js are opinionated frameworks for web-only React.

Expo Router is designed to bring the best architectural patterns to everyone, to ensure React Native is leveraged to its fullest. For example, Expo Router's [Async Routes](https://docs.expo.dev/router/reference/async-routes) feature enables lazy bundling for everyone. Previously, lazy bundling was only used at Meta to build the Facebook app.

#### Can I use Expo Router in my existing React Native app?

Yes, Expo Router is the framework for universal React Native apps. Due to the deep connection between the router and the bundler, Expo Router is only available in Expo CLI projects with Metro. Luckily, you can [use Expo CLI in any React Native project](https://docs.expo.dev/bare/using-expo-cli/) too!

#### What are the benefits of file-based routing?

- The file system is a well-known and well-understood concept. The simpler mental model makes it easier to educate new team members and scale your application.
- The fastest way to onboard new users is by having them open a universal link that opens the app or website to the correct screen depending on if they have the app installed or not. This technique is so advanced that it's usually only available to large companies that can afford to make and maintain the parity between platforms. But with Expo's file-based routing, you can have this feature out of the box!
- Refactoring is easier to do because you can move files around without having to update any imports or routing components.
- Expo Router has the ability to statically type routes automatically. This ensures you can only link to valid routes and that you can't link to a route that doesn't exist. Typed Routes also improve refactoring as you'll get type errors if links are broken.
- Async Routes (bundle splitting) improve development speed, especially in larger projects. They also make upgrades easier as errors are isolated to a single route, meaning you can incrementally update or refactor your app page-by-page rather than all at once (traditional React Native).
- Deep links always work, for every page. This makes it possible to share links to any content in the app, which is great for promoting your app, collecting bug reports, E2E testing, automating screenshots, and so on.
- Expo Head uses automatic links to enable deep-native integration. Features like Quick Notes, Handoff, Siri context, and universal links only require configuration setup, no code changes. This enables perfect vertical integration with the entire ecosystem of smart devices that a user has, leading to the types of user experiences that are only possible with universal apps (web ⇄ native).
- Expo Router has the ability to statically render each page automatically on the web, enabling real SEO and full discoverability of your app's content. This is only possible because of the file-based convention.
- **Expo CLI** can infer a lot of information about your application when it follows a known convention. For example, we could implement automatic bundle splitting per route, or automatically generate a sitemap for your website. This is impossible when your app only has a single entry point.
- Re-engagement features like notifications and home screen widgets are easier to integrate as you can simply intercept the launch and deep link, with query parameters, anywhere in the app.
- Like on the web, analytics and error reporting can easily be configured to automatically include the route name, which is useful for debugging and understanding user behavior.

#### Why should I use Expo Router over React Navigation?

Expo Router and React Navigation are both libraries from the Expo team. We built Expo Router on top of React Navigation to enable the benefits of file-based routing. Expo Router is a superset of React Navigation, meaning you can use any React Navigation components and APIs with Expo Router.

If file-based routing isn't right for your project, you can drop down to React Navigation and set up routes, types, and links manually.

#### How do I server-render my Expo Router website?

Basic static rendering (SSG) is supported in Expo Router. Server-side rendering currently requires custom infrastructure to set up.

## Next steps

[Quick start](https://docs.expo.dev/router/installation/#quick-start)

[Manual installation](https://docs.expo.dev/router/installation/#manual-installation)

[Router 101](https://docs.expo.dev/router/basics/core-concepts/)

[Example app](https://github.com/expo/expo/tree/main/templates/expo-template-tabs)

# Core concepts of file-based routing in Expo Router

_Learn the ground rules of Expo Router and how it relates to the rest of your code._

Before diving into how to construct your app's navigation tree with Expo Router, let's first understand the core concepts that make up the foundation of file-based routing in Expo Router, and how an Expo Router project might differ in structure from other React Native projects.

## The rules of Expo Router

### 1. All screens/pages are files inside of app directory

All navigation routes in your app are defined by the files and sub-directories inside the **app** directory. Every file inside the **app** directory has a default export that defines a distinct page in your app (except for the special **\_layout** files).

Accordingly, directories inside **app** define groups of related screens together as stacks, tabs, or in other arrangements.

### 2. All pages have a URL

All pages have a URL path that matches the file's location in the **app** directory, which can be used to navigate to that page in the address bar on the web, or as an app-specific deep link in a native mobile app. This is what is meant by Expo Router supporting "universal deep-linking". All pages in your app can be navigated to with a URL, regardless of the platform.

### 3. First index.tsx is the initial route

With Expo Router, you do not define an initial route or first screen in code. Rather, when you open your app, Expo Router will look for the first **index.tsx** file matching the `/` URL. This could be an **app/index.tsx** file, but it doesn't have to be. If the user should start by default in a deeper part of your navigation tree, you can use a [route group](https://docs.expo.dev/router/basics/notation/#parentheses) (a directory where the name is surrounded in parenthesis), and that will not count as part of the URL. If you want your first screen to be a group of tabs, you might put all of the tab pages inside the **app/(tabs)** directory and define the default tab as **index.tsx**. With this arrangement, the `/` URL will take the user directly to **app/(tabs)/index.tsx** file.

### 4. Root \_layout.tsx replaces App.jsx/tsx

Every project should have a **\_layout.tsx** file directly inside the **app** directory. This file is rendered before any other route in your app and is where you would put the initialization code that may have previously gone inside an **App.jsx** file, such as loading fonts or interacting with the splash screen.

### 5. Non-navigation components live outside of app directory

In Expo Router, the **app** directory is exclusively for defining your app's routes. Other parts of your app, like components, hooks, utilities, and so on, should be placed in other top-level directories. If you put a non-route inside of the **app** directory, Expo Router will attempt to treat it like a route.

Alternatively, you can create a [top-level **src** directory](https://docs.expo.dev/router/reference/src-directory/) and put your routes inside the **src/app** directory, with non-route components going in folders like **src/components**, **src/utils**, and so on. This is the only other directory structure that Expo Router will recognize.

### 6. It's still React Navigation under the hood

While this may sound quite a bit different from React Navigation, Expo Router is actually built on top of React Navigation. You can think of Expo Router as an Expo CLI optimization that translates your file structure into React Navigation components that you previously defined in your own code.

This also means that you can often refer to React Navigation documentation for how to style or configure navigation, as the default stack and tab navigators use the exact same options.

## The rules of Expo Router applied

Let's apply these foundational rules of Expo Router to quickly identify key elements of the following project file structure:

```
app/
│   ├── index.tsx
│   ├── home.tsx
│   ├── _layout.tsx
│   └── profile/
│       └── friends.tsx
components/
    ├── TextField.tsx
    └── Toolbar.tsx
```

- **app/index.tsx** is the initial route, and will appear first when you open the app or navigate to your web app's root URL.
- **app/home.tsx** is a page with the route `/home`, so you can navigate to it with a URL like `yourapp.com/home` in the browser, or `myapp://home` in a native app.
- **app/\_layout.tsx** is the root layout. Any initialization code you may have previously put in **App.jsx** should go here.
- **app/profile/friends.tsx** is a page with the route `/profile/friends`.
- **TextField.tsx** and **Toolbar.tsx** are not in the **app** directory, so they will not be considered pages. They will not have a URL, and they cannot be the target of a navigation action. However, they can be used as components in the pages inside of the **app** directory.

# Expo Router notation

_Learn how to use special filenames and notation to expressively define your app's navigation tree within your project's file structure._

When you look inside the **app** directory in a typical Expo Router project, you'll see a lot more than some simple file and directory names. What do the parentheses and brackets mean? Let's learn the significance of file-based routing notation and how it allows you to define complex navigation patterns.

## Types of route notation

### Simple names/no notation

```
app/
    ├── home.tsx
    └── feed/
        └── favorites.tsx
```

Regular file and directory names without any notation signify _static routes_. Their URL matches exactly as they appear in your file tree. So, a file named **favorites.tsx** inside the **feed** directory will have a URL of `/feed/favorites`.

### Square brackets

```
app/
    ├── [userName].tsx
    └── products/
        └── [productId]/
            └── index.tsx
```

If you see square brackets in a file or directory name, you are looking at a _dynamic route_. The name of the route includes a parameter that can be used when rendering the page. The parameter could be either in a directory name or a file name. For example, a file named **[userName].tsx** will match `/evanbacon`, `/expo`, or another username. Then, you can access that parameter with the `useLocalSearchParams` hook inside the page, using that to load the data for that specific user.

### Parentheses

```
app/
    └── (tabs)/
        ├── index.tsx
        └── settings.tsx
```

A directory with its name surrounded in parentheses indicates a _route group_. These directories are useful for grouping routes together without affecting the URL. For example, a file named **app/(tabs)/settings.tsx** will have `/settings` for its URL, even though it is not directly in the **app** directory.

Route groups can be useful for simple organization purposes, but often become more important for defining complex relationships between routes.

### index.tsx files

```
app/
    ├── (tabs)/
    │   └── index.tsx
    └── profile/
        └── index.tsx
```

Just like on the web, an **index.tsx** file indicates the default route for a directory. For example, a file named **profile/index.tsx** will match `/profile`. A file named **(tabs)/index.tsx** will match `/`, effectively becoming the default route for your entire app.

### \_layout.tsx files

```
app/
    ├── _layout.tsx
    ├── (tabs)/
    │   └── _layout.tsx
    └── feed/
        └── _layout.tsx
```

**\_layout.tsx** files are special files that are not pages themselves but define how groups of routes inside a directory relate to each other. If a directory of routes is arranged as a stack or tabs, the layout route is where you would define that relationship by using a stack navigator or tab navigator component.

Layout routes are rendered before the actual page routes inside their directory. This means that the **\_layout.tsx** directly inside the **app** directory is rendered before anything else in the app, and is where you would put the initialization code that may have previously gone inside an **App.jsx** file.

### Plus sign

```
app/
    ├── +not-found.tsx
    ├── +html.tsx
    ├── +native-intent.tsx
    └── +middleware.ts
```

Routes that include a `+` have special significance to Expo Router, and are used for specific purposes. A few examples:

- [`+not-found`](https://docs.expo.dev/router/error-handling/#unmatched-routes), which catches any requests that don't match a route in your app.
- [`+html`](https://docs.expo.dev/router/reference/static-rendering/#root-html) is used to customize the HTML boilerplate used by your app on web.
- [`+native-intent`](https://docs.expo.dev/router/advanced/native-intent/) is used to handle deep links into your app that don't match a specific route, such as links generated by third-party services.
- [`+middleware`](https://docs.expo.dev/router/reference/middleware/) is used to run code before a route is rendered, allowing you to perform tasks like authentication or redirection for every request.

## Route notation applied

Consider the following project file structure to identify the different types of routes represented:

```
app/
    ├── (tabs)/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── feed.tsx
    │   └── profile.tsx
    ├── _layout.tsx
    ├── users/
    │   └── [userId].tsx
    ├── +not-found.tsx
    └── about.tsx
```

- **app/about.tsx** is a static route that matches `/about`.
- **app/users/[userId].tsx** is a dynamic route that matches `/users/123`, `/users/456`, and so on.
- **app/(tabs)** is a route group. It will not factor into the URL, so `/feed` will match **app/(tabs)/feed.tsx**.
- **app/(tabs)/index.tsx** is the default route for the **(tabs)** directory, so it will be the initially-focused tab, and will match the `/` URL.
- **app/(tabs)/\_layout.tsx** is a layout file defining how the three pages inside **app/(tabs)/** relate to each other. If you use a tab navigator component inside of this file, then those screens will be arranged as tabs.
- **app/\_layout.tsx** is the root layout file, and is rendered before any other route in the app.
- **+not-found.tsx** is a special route that will be displayed if the user navigates to a route that doesn't exist in your app.

# Navigation layouts in Expo Router

_Learn how to construct different relationships between pages by using directories and layout files._

[Introduction to Expo Router Layout Files](https://www.youtube.com/watch?v=Yh6Qlg2CYwQ)

Each directory within the **app** directory (including **app** itself) can define a layout in the form of a **\_layout.tsx** file inside that directory. This file defines how all the pages within that directory are arranged. This is where you would define a stack navigator, tab navigator, drawer navigator, or any other layout that you want to use for the pages in that directory. The layout file exports a default component that is rendered before whatever page you are navigating to within that directory.

Let's look at a few common layout scenarios.

## Root layout

Virtually every app will have a **\_layout.tsx** file directly inside the **app** directory. This is the root layout and represents the entry point for your navigation. In addition to describing the top-level navigator for your app, this file is where you would put initialization code that may have previously gone inside an **App.jsx** file, such as loading fonts, interacting with the splash screen, or adding context providers.

Here's an example root layout:

```tsx app/_layout.tsx
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <Stack />;
}
```

The above example shows the splash screen initially and then renders a stack navigator once the fonts are loaded, which will cause your app to proceed to the initial route.

## Stacks

You can implement a stack navigator in your root layout, as shown above, or in any other layout file inside a directory. Let's suppose you have a file structure with a stack inside of a directory:

```
app/
    └── products/
        ├── _layout.tsx
        ├── index.tsx
        ├── [productId].tsx
        └── accessories/
            └── index.tsx
```

If you want everything inside of the **app/products** directory to be arranged in a stack relationship, inside the **\_layout.tsx** file, return a `Stack` component:

```tsx app/products/_layout.tsx
import { Stack } from 'expo-router';

export default function StackLayout() {
  return <Stack />;
}
```

When you navigate to `/products`, it will first go to the default route, which is **products/index.tsx**. If you navigate to `/products/123`, then that page will be pushed onto the stack. By default, the stack will render a back button in the header that will pop the current page off the stack, returning the user to the previous page. Even when a page isn't visible, if it is still pushed onto the stack, it is still being rendered.

The `Stack` component implements [React Navigation's native stack](https://reactnavigation.org/docs/native-stack-navigator/) and can use the same screen options. However, you do not have to define the pages specifically inside the navigator. The files inside the directory will be automatically treated as eligible routes in the stack. However, if you want to define screen options, you can add a `Stack.Screen` component inside the `Stack` component. The `name` prop should match the route name, but you do not need to supply a `component` prop; Expo Router will map this automatically:

```tsx app/products/_layout.tsx
import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="[productId]" options={{ headerShown: false }} />
    </Stack>
  );
}
```

While it is possible to nest navigators, be sure to only do so when it is truly needed. In the above example, if you want to push **products/accessories/index.tsx** onto the stack, it's not necessary to have an additional **\_layout.tsx** in the **accessories** directory with a `Stack` navigator. That would define another stack inside the first one. It is fine to add directories that only affect the URL, otherwise, use the same navigator as the parent directory.

## Tabs

Much like a stack, you can implement a tab navigator in your layout file, and all the routes directly inside that directory will be treated as tabs. Consider the following file structure:

```
app/
    └── (tabs)/
        ├── _layout.tsx
        ├── index.tsx
        ├── feed.tsx
        └── profile.tsx
```

In the **\_layout.tsx** file, return a `Tabs` component:

```tsx app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="house.fill" color={color} />,
        }}
      />
      <!-- Add more tabs here -->
    </Tabs>
  );
}
```

This will cause the **index.tsx**, **feed.tsx**, and **profile.tsx** files to appear together in the same bottom tabs navigator. This `Tabs` component uses [React Navigation's native bottom tabs](https://reactnavigation.org/docs/bottom-tab-navigator/) and supports the same options.

In the case of `Tabs`, you will likely want to define the tabs in the navigator, as this influences the order in which tabs appear, the title, and the icon inside the tab. The index route will be the default selected tab.

## Slot

In some cases, you may want a layout without a navigator. This is helpful for adding a header or footer around the current route, or for displaying a modal over any route inside a directory. In this case, you can use the `Slot` component, which serves as a placeholder for the current child route.

Consider the following file structure:

```
app/
    └── social/
        ├── _layout.tsx
        ├── index.tsx
        ├── feed.tsx
        └── profile.tsx
```

For example, you may want to wrap any route inside the **social** directory with a header and footer, but you want navigating between the pages to simply replace the current page rather than pushing new pages onto a stack, which can then later be popped off with a "back" navigation action. In the **\_layout.tsx** file, return a `Slot` component surrounded by your header and footer:

```tsx app/social/_layout.tsx
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <>
      <Header />
      <Slot />
      <Footer />
    </>
  );
}
```

## Other layouts

These are just a few examples of common layouts to give you an idea of how it works. There's much more you can do with layout:

- Implement a [Drawer navigator](https://docs.expo.dev/router/advanced/drawer)
- Replace the default tabs with [fully customized tabs](https://docs.expo.dev/router/advanced/custom-tabs)
- Use a [modal](https://docs.expo.dev/router/advanced/modals) to display a page with transparency, such that the parent navigator is still visible underneath
- [Adapt any navigator that is compatible with React Navigation](https://docs.expo.dev/versions/latest/sdk/router/#withlayoutcontextnav-processor), including top tabs, bottom sheets, and more

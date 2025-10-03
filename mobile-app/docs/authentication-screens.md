# Authentication Screens Documentation

## Overview

This document describes the authentication screens implemented for the RenderCon Demo mobile app using Expo Router and Better Auth.

## Screen Structure

### 1. Welcome Screen (`src/app/index.tsx`)
- **Route**: `/`
- **Purpose**: Landing page for new users
- **Features**:
  - Sign In button (navigates to `/sign-in`)
  - Create Account button (navigates to `/sign-up`)
  - Continue as Guest option (navigates to `/(tabs)`)
- **Design**: Clean, centered layout with primary and secondary CTAs

### 2. Sign In Screen (`src/app/sign-in.tsx`)
- **Route**: `/sign-in`
- **Purpose**: Authenticate existing users
- **Features**:
  - Email input field
  - Password input field (secure entry)
  - Forgot Password link
  - Sign In button with loading state
  - Link to Sign Up screen
- **Validation**:
  - Checks for empty fields
  - Shows alerts on authentication errors
- **Auth Integration**: Uses `authClient.signIn.email()`

### 3. Sign Up Screen (`src/app/sign-up.tsx`)
- **Route**: `/sign-up`
- **Purpose**: Register new users
- **Features**:
  - Full Name input field
  - Email input field
  - Password input field with helper text
  - Confirm Password field
  - Sign Up button with loading state
  - Link to Sign In screen
- **Validation**:
  - All fields required
  - Email format validation (regex)
  - Password minimum length (8 characters)
  - Password confirmation match
- **Auth Integration**: Uses `authClient.signUp.email()`
- **Success Flow**: Shows success alert and redirects to sign-in

### 4. Forgot Password Screen (`src/app/forgot-password.tsx`)
- **Route**: `/forgot-password`
- **Purpose**: Password recovery
- **Features**:
  - Email input field
  - Send Reset Link button with loading state
  - Cancel button (goes back)
  - Success state showing confirmation
  - Try Different Email option
- **Validation**:
  - Email required
  - Email format validation
- **Auth Integration**: Uses `authClient.forgetPassword()`
- **Success State**: Displays checkmark icon and confirmation message

## Navigation Flow

```
index (Welcome)
  ├─> sign-in
  │     ├─> forgot-password
  │     └─> sign-up
  ├─> sign-up
  │     └─> sign-in
  └─> (tabs) [Guest access]
```

## Styling Approach

All screens use:
- **React Native StyleSheet** for consistent styling
- **Themed components** from `@/src/components/Themed` for dark mode support
- **Consistent color scheme**: Primary blue (#007AFF)
- **Responsive layout**: KeyboardAvoidingView and ScrollView for better UX
- **Loading states**: ActivityIndicator during async operations
- **Alert dialogs**: Native alerts for errors and confirmations

## Key Features

### Interactive Elements
- Touch feedback on all buttons
- Disabled states during loading
- Proper keyboard handling (dismiss on tap outside)
- Auto-capitalize and auto-complete hints
- Secure text entry for passwords

### User Experience
- Clear error messages via alerts
- Loading indicators during async operations
- Keyboard-aware layouts (shifts content on keyboard open)
- Smooth navigation transitions
- Helper text for password requirements
- Visual success confirmation on forgot password

### Code Quality
- TypeScript for type safety
- Clean, modular component structure
- Consistent naming conventions
- Proper error handling with try-catch
- Validated inputs before API calls
- No linter errors

## Better Auth Integration

The screens integrate with Better Auth through `src/lib/auth-client.ts`:

```typescript
// Sign In
await authClient.signIn.email({ email, password })

// Sign Up
await authClient.signUp.email({ email, password, name })

// Forgot Password
await authClient.forgetPassword({ email, redirectTo })
```

## Future Enhancements

Consider adding:
- Social authentication (Google, Apple)
- Email verification flow
- Password reset confirmation screen
- Biometric authentication
- Remember me functionality
- Two-factor authentication UI
- Phone number authentication
- OAuth providers


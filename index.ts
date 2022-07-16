// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>TypeScript Starter</h1>`;

// setting for look like rxjs
console.clear();

interface Observer {
  next: (value: any) => void;
  error: (err: any) => void;
  complete: () => void;
}

type TearDown = () => void;

type OperatorFunction = (source: Observable) => Observable;

class Subscription {
  teardownList: TearDown[] = [];
  constructor(teardown?: TearDown) {
    if (teardown) {
      this.teardownList.push(teardown);
    }
  }

  add(subscription: Subscription) {
    this.teardownList.push(() => subscription.unsubscribe());
  }

  unsubscribe() {
    this.teardownList.forEach((teardown) => teardown());
    this.teardownList = [];
  }
}

class Observable {
  pipe(this: Observable, ...operators: OperatorFunction[]) {
    let source = this;
    operators.forEach((operator) => {
      source = operator(source);
    });
    return source;
  }

  subscriber: (observer: Observer) => TearDown;
  constructor(subscriber: (observer: Observer) => TearDown) {
    this.subscriber = subscriber;
  }

  subscribe(observer: Observer) {
    const teardown: TearDown = this.subscriber(observer);
    const subscription = new Subscription(teardown);
    return subscription;
  }
}

const observer: Observer = {
  next: (value: any) => console.log('observer next', value),
  error: (err: any) => console.log('observer error', err),
  complete: () => console.log('observer complete'),
};
// Start coding

import { interval, of } from 'rxjs';

function mapTo(arg: any) {
  return (source: Observable) =>
    new Observable((observer) => {
      console.log('subscribe!');
      const subscription = source.subscribe({
        next: (value: any) => {
          observer.next(`${arg} ${value}`);
        },
        error: (err: any) => {
          observer.error(err);
        },
        complete: () => {
          observer.complete();
        },
      });
      return () => {
        console.log('unsubscribe!');
        subscription.unsubscribe();
      };
    });
}

function tap(fn: (value: any) => void) {
  return (source: Observable) =>
    new Observable((observer) => {
      console.log('subscribe!');
      const subscription = source.subscribe({
        next: (value) => {
          fn(value);
          observer.next(value);
        },
        error: (err) => {
          observer.error(err);
        },
        complete: () => {
          observer.complete();
        },
      });
      return () => {
        console.log('unsubscribe!');
        subscription.unsubscribe();
      };
    });
}

function map(fn: (value: any) => any) {
  return (source: Observable) =>
    new Observable((observer) => {
      console.log('subscribe!');
      const subscription = source.subscribe({
        next: (value) => {
          const newValue = fn(value);
          observer.next(newValue);
        },
        error: (err) => {
          observer.error(err);
        },
        complete: () => {
          observer.complete();
        },
      });
      return () => {
        subscription.unsubscribe();
      };
    });
}

const myInterval = interval(1000);
const mapHello = mapTo('Hello');

// const testtap = myInterval
//   .pipe(
//     tap((val) => console.log('tap', val)),
//     mapHello,
//     tap((val) => console.log('after map hello :', val))
//   )
//   .subscribe(observer);

// setTimeout(() => {
//   testtap.unsubscribe();
// }, 5000);

// const mapWorld = mapTo('World');
// const testmap = myInterval
//   .pipe(
//     tap((val) => console.log('before map :', val)),
//     map((val) => `hello ${val}`),
//     tap((val) => console.log('after map :', val)),
//     mapWorld
//   )
//   .subscribe(observer);

// setTimeout(() => {
//   testmap.unsubscribe();
// }, 5000);

of([10, 20, 30, 40])
  .pipe(
    map((valuearray) => {
      let sum = 0;
      valuearray.forEach((value) => (sum += value));
      return sum;
    })
  )
  .subscribe(observer);

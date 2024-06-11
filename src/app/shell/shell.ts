import { Aurelia, PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';

export class Shell {
    router: Router;

    configureRouter(config: RouterConfiguration, router: Router) {
        //config.title = 'TacTix';
        config.map([{
            route: ['', 'tic-tac-toe'],
            name: 'tic-tac-toe',
            settings: { icon: 'home' },
            moduleId: PLATFORM.moduleName('../tic-tac-toe/tic-tac-toe'),
            nav: true,
            title: 'Tic-Tac-Toe'
        }, {
            route: 'about',
            name: 'about',
            settings: { icon: 'education' },
            moduleId: PLATFORM.moduleName('../about/about'),
            nav: true,
            title: 'About'
        }
        , {
            route: 'contact',
            name: 'contact',
            settings: { icon: 'knight' },
            moduleId: PLATFORM.moduleName('../contact/contact'),
            nav: true,
            title: 'Contact'
        }

       ]);

        this.router = router;
    }
}
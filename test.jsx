import { renderToHtml } from 'jsxlib/jsx';
import { name } from 'jsxlib';

const App = ({ name, children }) => {
    return <div>I have name "{name}" and children {children}</div>;
};

console.log(name);
console.log(<h1 info="Header" date={new Date(Date.now()).getFullYear()}>aaaaa</h1>);
console.log(<><p>11</p><p>22</p></>);
console.log(renderToHtml(<div date={new Date(Date.now()).getFullYear()}>123</div>, { pretty: true }));
console.log(renderToHtml(<App name="Name1"><h6>header6</h6><p>ppppp</p></App>, { pretty: true }));

import _true from './true';
import _false from './false';
import echo from './echo';
import date from './date';
import sleep from './sleep';
import grep from './grep';

const commands = new Map();

commands.set('true', _true);
commands.set('false', _false);
commands.set('echo', echo);
commands.set('date', date);
commands.set('sleep', sleep);
commands.set('grep', grep);

export default commands;

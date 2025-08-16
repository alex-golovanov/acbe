import serversList from 'servers.json';
import storage from 'storage';


export default async() => await storage.get( 'serversObject' ) || serversList;

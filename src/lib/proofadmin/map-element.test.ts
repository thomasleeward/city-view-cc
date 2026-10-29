import {it as test} from 'vitest';
import assert from 'node:assert/strict';
import {layoutElementSchema,layoutSchema} from './contract';
import {mapLinks} from './map-links';
const map={id:'map',type:'map',address:'  123 Example St & Main, Durham, NC  '};
test('maps retain plain editable values in any column with compatible defaults',()=>{
 const grid={rows:[{id:'row',columns:[{id:'left',elements:[{id:'keep',type:'text',text:'Keep me'}]},{id:'right',elements:[map]}]}]};
 const parsed=layoutSchema.parse(grid),element=parsed.rows[0].columns[1].elements[0];
 assert.equal(element.type,'map');if(element.type!=='map')throw Error('Wrong type');
 assert.equal(element.address,map.address.trim());assert.equal(element.height,320);assert.equal(element.showDirections,true);
 assert.deepEqual(parsed.rows[0].columns[0].elements,grid.rows[0].columns[0].elements);
 assert.equal(layoutElementSchema.parse({id:'empty',type:'map'}).type,'map');
});
test('map validation rejects invalid sizes, rich text, control characters and executable fields',()=>{
 for(const patch of [{height:159},{height:801},{height:320.5},{height:'320'},{showDirections:'yes'},{address:'x'.repeat(501)},{address:'richtext:v1:{}'},{address:'One\nTwo'},{address:'bad\u0000value'},{src:'https://bad.example'},{html:'<iframe></iframe>'},{css:'body{}'}])assert.equal(layoutElementSchema.safeParse({...map,...patch}).success,false,JSON.stringify(patch));
 for(const height of [160,800])assert.equal(layoutElementSchema.safeParse({...map,height,showDirections:false}).success,true);
});
test('map URLs derive one encoded address without accepting hosts or extra URL parameters',()=>{
 assert.equal(mapLinks('  '),null);
 const address='https://bad.example/?q=<script>&output=evil#fragment',links=mapLinks(address)!;
 const embed=new URL(links.embed),directions=new URL(links.directions);
 assert.equal(embed.origin,'https://maps.google.com');assert.equal(embed.searchParams.get('q'),address);assert.equal(embed.searchParams.get('output'),'embed');assert.equal(embed.hash,'');assert.equal([...embed.searchParams].length,2);
 assert.equal(directions.origin,'https://www.google.com');assert.equal(directions.searchParams.get('destination'),address);assert.equal(directions.searchParams.get('api'),'1');
});

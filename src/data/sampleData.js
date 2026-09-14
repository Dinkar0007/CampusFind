export const makeId = prefix => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*900+100)}`;

const now = new Date().toISOString();

export const seedData = {
  categories:["Wallet","Mobile Phone","Keys","ID Card","Bag","Books","Earphones","Watch","Other"],
  locations:["Library","Canteen","Parking Area","Computer Lab","Classroom","Auditorium","Sports Ground","Main Gate","Laboratory","Hostel"],
  users:[
    {id:"U-001",name:"Ravi Student",email:"student@college.edu",password:"student123",studentId:"PIET2024BCA001",role:"student"},
    {id:"U-002",name:"College Admin",email:"admin@college.edu",password:"admin123",studentId:"ADMIN001",role:"admin"}
  ],
  lostItems:[
    {id:"L-1001",name:"Black Leather Wallet",category:"Wallet",image:"",colour:"Black",brand:"WildHorn",description:"Black leather wallet with a simple card section. I last remember having it near the college canteen.",date:"2026-09-12",time:"13:20",location:"Canteen",uniqueDetails:"Has a small scratch near the corner.",remarks:"Please contact through the platform.",reporterId:"U-001",status:"Possible Match",createdAt:now}
  ],
  foundItems:[
    {id:"F-1001",name:"Black Leather Wallet",category:"Wallet",image:"",colour:"Black",brand:"WildHorn",description:"Black leather wallet found near the canteen seating area.",date:"2026-09-12",time:"13:45",location:"Canteen",remarks:"Handed over through CampusFind.",reporterId:"U-002",status:"Found",createdAt:now}
  ],
  matches:[
    {id:"M-1001",lostId:"L-1001",foundId:"F-1001",score:94,factors:[
      {label:"Category: Match",ok:true},{label:"Colour: Match",ok:true},{label:"Brand: Match",ok:true},
      {label:"Item name: Strong",ok:true},{label:"Description: High similarity",ok:true},{label:"Location: Strong Match",ok:true},{label:"Date: Close",ok:true}
    ]}
  ],
  claims:[],
  notifications:[
    {id:"N-1001",userId:"U-001",text:"A possible match was found for your Black Leather Wallet.",createdAt:now,read:false}
  ],
  sightings:[
    {id:"S-1001",lostId:"L-1001",location:"Canteen",date:"2026-09-12",time:"13:40",description:"I noticed a black wallet near the canteen seating area.",reporterId:"U-002"}
  ],
  adminActions:[]
};
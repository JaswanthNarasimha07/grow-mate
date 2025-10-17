import express from 'express'
import cors from 'cors'
const app = express()
app.use(express.json())
app.use(cors({origin:['http://localhost:5173']}))
let plants = []
const makeId = () => Math.random().toString(36).slice(2)+Date.now().toString(36)
const validLight = v => ['Low','Medium','High'].includes(v)?v:'Medium'
app.get('/api/plants',(req,res)=>{res.json(plants.slice().reverse())})
app.post('/api/plants',(req,res)=>{
  const {name,lightLevel,frequencyDays,lastWatered}=req.body||{}
  if(!name||!frequencyDays){return res.status(400).json({error:'name and frequencyDays required'})}
  const p={_id:makeId(),name:String(name),lightLevel:validLight(lightLevel),frequencyDays:Number(frequencyDays),lastWatered:lastWatered?new Date(lastWatered):new Date()}
  plants.push(p)
  res.status(201).json(p)
})
app.put('/api/plants/:id',(req,res)=>{
  const i=plants.findIndex(x=>x._id===req.params.id)
  if(i===-1){return res.status(404).json({error:'not found'})}
  const {name,lightLevel,frequencyDays,lastWatered}=req.body||{}
  const next={...plants[i]}
  if(name!==undefined) next.name=String(name)
  if(lightLevel!==undefined) next.lightLevel=validLight(lightLevel)
  if(frequencyDays!==undefined) next.frequencyDays=Number(frequencyDays)
  if(lastWatered!==undefined) next.lastWatered=new Date(lastWatered)
  plants[i]=next
  res.json(next)
})
app.patch('/api/plants/:id/water',(req,res)=>{
  const i=plants.findIndex(x=>x._id===req.params.id)
  if(i===-1){return res.status(404).json({error:'not found'})}
  plants[i]={...plants[i],lastWatered:new Date()}
  res.json(plants[i])
})
app.delete('/api/plants/:id',(req,res)=>{
  const i=plants.findIndex(x=>x._id===req.params.id)
  if(i===-1){return res.status(404).json({error:'not found'})}
  plants.splice(i,1)
  res.status(204).end()
})
app.listen(4001,()=>{})
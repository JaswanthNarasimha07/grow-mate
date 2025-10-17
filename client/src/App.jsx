import React,{useEffect,useRef,useState} from 'react'
import { listPlants, createPlant, updatePlant, waterPlant, deletePlant } from './api'
import { fmtDue } from './utils'
export default function App(){
  const [items,setItems]=useState([])
  const [name,setName]=useState('')
  const [light,setLight]=useState('Medium')
  const [freq,setFreq]=useState(3)
  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10))
  const load=()=>listPlants().then(setItems)
  useEffect(()=>{load()},[])
  const add=async()=>{if(!name.trim())return;await createPlant({name,lightLevel:light,frequencyDays:Number(freq),lastWatered:date});setName('');setLight('Medium');setFreq(3);setDate(new Date().toISOString().slice(0,10));load()}
  const water=async(id)=>{const x=await waterPlant(id);setItems(prev=>prev.map(p=>p._id===id?x:p))}
  const onDelete=async(id)=>{await deletePlant(id);load()}
  const onUpdate=async(id,patch)=>{const p=await updatePlant(id,patch);setItems(prev=>prev.map(x=>x._id===id?p:x))}
  return (<div className="container">
    <h1>GrowMate</h1>
    <div className="sub">Track plant watering. Add a plant, set its light level and watering frequency. Click the name to edit, tap Watered to refresh, swipe left to delete.</div>
    <div className="form">
      <div className="field"><div className="label">Plant name</div><input className="input" placeholder="e.g., Monstera" value={name} onChange={e=>setName(e.target.value)}/></div>
      <div className="field"><div className="label">Light level</div><select className="select" value={light} onChange={e=>setLight(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></div>
      <div className="field"><div className="label">Water every (days)</div><input className="input" type="number" min="1" value={freq} onChange={e=>setFreq(e.target.value)} placeholder="3"/></div>
      <div className="field hideMobile"><div className="label">Last watered date</div><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
      <div className="field" style={{justifyContent:'end'}}><button className="button" onClick={add}>Add Plant</button></div>
    </div>
    <div className="list">{items.map(p=>(<SwipeRow key={p._id} onDelete={()=>onDelete(p._id)}>
      <PlantCard p={p} onWater={()=>water(p._id)} onChange={(patch)=>onUpdate(p._id,patch)} onDelete={()=>onDelete(p._id)}/>
    </SwipeRow>))}</div>
  </div>)}
function PlantCard({p,onWater,onChange,onDelete}){
  const due=fmtDue(p.lastWatered,p.frequencyDays)
  const [editing,setEditing]=useState(false)
  const [name,setName]=useState(p.name)
  const saveName=()=>{if(name.trim()&&name!==p.name){onChange({name})}setEditing(false)}
  return (<div className="card item">
    <div className="row" style={{justifyContent:'space-between'}}>
      <div className="row" style={{gap:12}}>
        <div className="leaf">🌿</div>
        <div>
          <div className="title" onClick={()=>setEditing(true)}>{editing?<input autoFocus className="input nameEdit" value={name} onChange={e=>setName(e.target.value)} onBlur={saveName} onKeyDown={e=>{if(e.key==='Enter')saveName();if(e.key==='Escape')setEditing(false)}}/>:name}</div>
          <div className="kicker">{p.lightLevel} • every {p.frequencyDays}d • last {new Date(p.lastWatered).toLocaleDateString()}</div>
        </div>
      </div>
      <div className="actions">
        <span className="badge count">Next watering: {due.label}</span>
        <button className="button" onClick={onWater}>Watered</button>
        <button className="button hideMobile" onClick={onDelete}>Delete</button>
      </div>
    </div>
    <div className="hint">Swipe left to delete</div>
  </div>)}
function SwipeRow({children,onDelete}){
  const ref=useRef(null)
  const startX=useRef(0)
  const dx=useRef(0)
  const [open,setOpen]=useState(false)
  const onStart=e=>{startX.current=(e.touches?e.touches[0].clientX:e.clientX);dx.current=0}
  const onMove=e=>{if(startX.current===0)return;const x=(e.touches?e.touches[0].clientX:e.clientX);dx.current=x-startX.current;const el=ref.current;if(el){const t=Math.min(0,dx.current);el.style.transform=`translateX(${t}px)`}}
  const onEnd=()=>{const el=ref.current;if(!el)return;const shouldOpen=dx.current<-60;el.style.transform=shouldOpen?'translateX(-100px)':'translateX(0px)';setOpen(shouldOpen);startX.current=0}
  const close=()=>{const el=ref.current;if(el)el.style.transform='translateX(0px)';setOpen(false)}
  return (<div style={{position:'relative'}} className="item" onMouseLeave={close}>
    <div className="deleteReveal">{open?<button className="deleteBtn" onClick={onDelete}>Delete</button>:null}</div>
    <div className="swipe" ref={ref} onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}>{children}</div>
  </div>)}

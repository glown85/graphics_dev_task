import { Mesh, Scene, Vector3, MeshBuilder, ActionManager,ExecuteCodeAction  } from 'babylonjs';
import { Geometry, BoxGeometry, SphereGeometry, CylinderGeometry} from './geometry.types'
import { applyBouncing } from './animations';


/**
 * basic class for mesh geometries
 * to reuse functions
 */
class BasicGeometry implements Geometry {
    mesh!:Mesh;
    div!:HTMLElement;
    name!:string;
    scene!:Scene;
    position!:Vector3;
    constructor(name:string, position:Vector3, scene:Scene){}

    //#region transform methods 
    resetPosition():void{
        this.scene.stopAnimation(this.mesh);
        this.mesh.position.y = this.position.y + (this.mesh.scaling.y/2);
    }

    setWidth(width:number):void{
        this.resetPosition();

        this.mesh.scaling.x = width;
    }

    setHeigth(height:number):void{
        this.resetPosition();

        this.mesh.scaling.y = height;
        this.mesh.position.y = this.position.y + (this.mesh.scaling.y/2);
    }

    setDepth(depth:number):void{
        this.resetPosition();

        this.mesh.scaling.z = depth;
    }

    setDiameter(diameter:number):void{
        this.resetPosition();

        this.mesh.scaling.x = diameter;
        this.mesh.scaling.z = diameter;
    }

    setSize(size:number):void{
        this.scene.stopAnimation(this.mesh);

        this.mesh.scaling.x = size;
        this.mesh.scaling.y = size;
        this.mesh.scaling.z = size;
        this.mesh.position.y = this.position.y + (this.mesh.scaling.y);

    }
    //#endregion

    //#region html helpers

    /**
     * create a ranged input
     * @param name label name
     * @param inputFunction function to execut on each change
     * @param min min value
     * @param max max value
     * @param step step of input
     * @returns HTMLelement 
     */
    createRangedInput(name:string, inputFunction:Function, min=0.2, max=2, step=0.1):HTMLElement{
        const modalContent = document.createElement("div");
        modalContent.className = "div-input";

        const label = document.createElement("label");
        label.innerHTML = name;

        const range = document.createElement("input");
        range.className = "input-content";

        range.type= "range";
        range.min = ""+min;
        range.max = ""+max;
        range.step= ""+step;

        (range as HTMLInputElement).oninput  = (e:Event) => inputFunction(e) ;
        modalContent.appendChild(label);
        modalContent.appendChild(range);

        return modalContent;
    }

    /**
     * create html close button
     * @param modal div to put the close button
     * @returns close button
     */
    createCloseButton(modal:HTMLElement):HTMLElement{

        const close = document.createElement("span");
        close.className = "close";
        close.innerHTML = "&times;"
        close.onclick = function() {
            modal.style.display = "none";
        }

        return close;   
    }

    /**
     * create animation div, with amplitude, duration and its labels
     * and a animation button
     * @returns animation div:HTMLElement
     */
    createAnimationDiv():HTMLElement{
        const modalContent = document.createElement("div");
        modalContent.id = "div-content"
        modalContent.className = "animation-div";

        //amplitude
        const amplitudeLabel = document.createElement("label");
        amplitudeLabel.innerHTML = "Amplitude:";
        modalContent.appendChild(amplitudeLabel);


        const amplitude =  document.createElement("input")
        amplitude.className = "animation-input";
        amplitude.type = "number";
        amplitude.value = "10";
        modalContent.appendChild(amplitude);

        //duration
        const durationLabel = document.createElement("label");
        durationLabel.innerHTML = "Duration:";
        modalContent.appendChild(durationLabel);

        const duration =  document.createElement("input")
        duration.className = "animation-input";
        duration.type = "number";
        duration.value = "4000";
        modalContent.appendChild(duration);

        const btn = document.createElement("button");
        btn.className = "animation-btn";
        btn.innerHTML = "bounce";
        let mesh = this.mesh;
        btn.onclick = function() {
            applyBouncing(mesh,parseInt(amplitude.value),parseInt(duration.value));
        }
        modalContent.appendChild(btn);

        return modalContent;   
    }

    /**
     * create header div that contains the name
     * its close button and its draggable
     * @param modal modal div
     * @returns 
     */
    createHeader(modal:HTMLElement):HTMLElement{
        const header = document.createElement("div");
        header.id = this.name + "-div-header"
        header.className = "modal-header";
        const name = document.createElement("label");
        name.innerHTML = this.name;
        header.appendChild(name)

        //closeButton
        const close = this.createCloseButton(modal);
        header.appendChild(close);


        return header;

    }


    /**
     * enable drag to an modal
     * @param element modal div
     */
    bindDrag(element:HTMLElement):void{
        function dragElement(elmnt:HTMLElement) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (document.getElementById(elmnt.id + "-header")) {
                /* if present, the header is where you move the DIV from:*/
                document.getElementById(elmnt.id + "-header")!.onmousedown = dragMouseDown;
            } else {
                /* otherwise, move the DIV from anywhere inside the DIV:*/
                // elmnt.onmousedown = dragMouseDown;
            }
        
            function dragMouseDown(e:MouseEvent) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }
        
            function elementDrag(e:MouseEvent) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }
        
            function closeDragElement() {
                /* stop moving when mouse button is released:*/
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }

        dragElement(element)
    }
    //#endregion
}


export class Sphere extends BasicGeometry implements SphereGeometry{
    constructor(name:string, position:Vector3, scene:Scene){
        super(name, position, scene)
        this.name = name;
        this.position = position;
        this.scene = scene;

        this.mesh = MeshBuilder.CreateIcoSphere(this.name, {subdivisions: 10, updatable:true}, scene);
	    this.mesh.position.set(position.x, position.y+ (this.mesh.scaling.y), position.z);

        (this.mesh as any).basicGeometry = this; //save instance in mesh
        let div = this.createHtml();
        this.div = div;

        this.mesh.actionManager = new ActionManager(scene);
        this.mesh.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPickTrigger, function(e) {
                    div.style.display = "block";
                }
            )
        );
    }



    /**
     * create a new geometry and parse its values to the old one
     * @param value number of subdivision
     */
    setSubdivisions(value:number):void{
        //stop animation and reset its position
        this.resetPosition();

        //creating a dummy to get its vertices data
        let dummyObj = MeshBuilder.CreateIcoSphere("dummy", {subdivisions: parseInt(value.toString())}, this.scene);
        this.scene.removeMesh(dummyObj);//this is ridiculous

        var positions = dummyObj.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        var normals = dummyObj.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        var colors = dummyObj.getVerticesData(BABYLON.VertexBuffer.ColorKind);
        var uvs = dummyObj.getVerticesData(BABYLON.VertexBuffer.UVKind);
        var indices = dummyObj.getIndices();
        
        //updating the exisiting obj with the dummyObj values
        this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions!);
        this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals!);
        this.mesh.updateVerticesData(BABYLON.VertexBuffer.ColorKind, colors!);
        this.mesh.updateVerticesData(BABYLON.VertexBuffer.UVKind, uvs!);
        this.mesh.updateIndices(indices!);

    }

    /**
     * reset y position. sphere position is equals to its position plus its scaling 
     * (sphere scale goes to the center to the bottom of the mesh) 
     */
    resetPosition():void{
        this.scene.stopAnimation(this.mesh);
        this.mesh.position.y = this.position.y + (this.mesh.scaling.y);
    }

    /**
     * create modal html element to interact with scene obj
     * @returns modal:HTMLElement
     */
    createHtml():HTMLElement{
        const modalContent = document.createElement("div");
        modalContent.id = this.name + "-div"
        modalContent.className = "modal-content";

        const header = this.createHeader(modalContent);
        modalContent.appendChild(header)
        
        const diameter = this.createRangedInput("diameter", (e:any)=>this.setSize(parseFloat(e.target!.value)));
        const subdivisions = this.createRangedInput("subdivisions", (e:any)=>this.setSubdivisions(parseFloat(e.target!.value)),1,10,1);
        
        modalContent.appendChild(diameter);
        modalContent.appendChild(subdivisions);

        //bounce animation
        const animation = this.createAnimationDiv();
        modalContent.appendChild(animation);

        document.body.appendChild(modalContent);
        this.bindDrag(modalContent);

        return modalContent;
    }
}


export class Box extends BasicGeometry implements BoxGeometry{
    constructor(name:string, position:Vector3, scene:Scene){
        super(name, position, scene)
        this.name = name;
        this.position = position;
        this.scene = scene;

        this.mesh = MeshBuilder.CreateBox(this.name, {}, scene);
        this.mesh.position.set(position.x, position.y + (this.mesh.scaling.y/2), position.z);
        (this.mesh as any).basicGeometry = this; //save instance in mesh
        
        let div = this.createHtml();
        this.div = div;

        this.mesh.actionManager = new ActionManager(scene);
        this.mesh.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPickTrigger, function(e) {
                    div.style.display = "block";
                }
            )
        );


    }

    /**
     * create modal html element to interact with scene obj
     * @returns modal:HTMLElement
     */
    createHtml():HTMLElement{
        const modalContent = document.createElement("div");
        modalContent.id = this.name + "-div"
        modalContent.className = "modal-content";

        const header = this.createHeader(modalContent);
        modalContent.appendChild(header);    
        
        //ranged inputs
        const height = this.createRangedInput("Height", (e:any)=>this.setHeigth(parseFloat(e.target.value)));
        const width  = this.createRangedInput("Width",  (e:any)=>this.setWidth(parseFloat(e.target.value)));
        const depth  = this.createRangedInput("Depth",  (e:any)=>this.setDepth(parseFloat(e.target.value)));

        modalContent.appendChild(width);
        modalContent.appendChild(height);
        modalContent.appendChild(depth);

        //bounce animation
        const animation = this.createAnimationDiv();
        modalContent.appendChild(animation);

        document.body.appendChild(modalContent);
        this.bindDrag(modalContent);

        return modalContent;
    }


}


export class Cylinder extends BasicGeometry implements CylinderGeometry{
    constructor(name:string, position:Vector3, scene:Scene){
        super(name, position, scene)
        this.name = name;
        this.position = position;
        this.scene = scene;
        this.mesh  = MeshBuilder.CreateCylinder(this.name, {}, scene);
        (this.mesh as any).basicGeometry = this; //save instance in mesh


        this.mesh.position.set(position.x, position.y + (this.mesh.scaling.y), position.z);
        let div = this.createHtml();
        this.div = div;

        this.mesh.actionManager = new ActionManager(scene);
        this.mesh.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPickTrigger, function(e) {
                    div.style.display = "block";
                }
            )
        );
    }

    resetPosition():void{
        this.scene.stopAnimation(this.mesh);
        this.mesh.position.y = this.position.y + (this.mesh.scaling.y);
    }

    setHeigth(height:number):void{
        this.scene.stopAnimation(this.mesh);
        this.mesh.scaling.y = height;
        this.mesh.position.y = this.position.y + (this.mesh.scaling.y);
    }

    /**
     * create modal html element to interact with scene obj
     * @returns modal:HTMLElement
     */
    createHtml():HTMLElement{
        const modalContent = document.createElement("div");
        modalContent.id = this.name + "-div";
        modalContent.className = "modal-content";

        
        const header = this.createHeader(modalContent);
        modalContent.appendChild(header);   
        
        const height = this.createRangedInput("height", (e:any)=>this.setHeigth(parseFloat(e.target.value)));
        const diameter = this.createRangedInput("diameter", (e:any)=>this.setDiameter(parseFloat(e.target.value)));
        
        modalContent.appendChild(diameter);
        modalContent.appendChild(height);

        //bounce animation
        const animation = this.createAnimationDiv();
        modalContent.appendChild(animation);

        document.body.appendChild(modalContent);
        this.bindDrag(modalContent);

        return modalContent;
    }
}
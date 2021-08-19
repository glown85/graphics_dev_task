import {  Mesh, Animation  } from 'babylonjs';


/**
 * bounce animation of an object.
 * its made by calculating each frame of an animation, than seting the framerate to match the duration
 * first version was made by creating fewer keyframes, and making a 'learping' animation, but the
 * distance of each intervals of keyframes would have a diferent velocity, so the animation was
 * demonstrating a visual lag
 * the cleanest way was to calculating the velocity of each frame to make a better animation overall
 * 
 * @param node mesh to be aplied the animation
 * @param amplitude initial height of the object to be dropd
 * @param duration max duration of the animation
 * @param bounceFactor how much of its velocity it retains after the bounce
 */
 export function applyBouncing(node:Mesh, amplitude:number, duration:number, bounceFactor=0.7):void{
	 //reset position and stop previously animation
	(node as any).basicGeometry.resetPosition();
	node._scene.stopAnimation(node);

	//#region error check
	//check if the paramters are correct
	if(bounceFactor >0.99 || bounceFactor<0){
		console.error("bounceFactor out of range");
		return;
	}
	if(amplitude<=0 || duration<=0){
		console.error("invalid parameters");
		return;
	}
	//#endregion
	
	//#region animation paramters
	let frameRate = 60;//1 frame por ms
    let objHeight = parseFloat(node.position.y.toString());//to displace the obj to not pass the ground

	const animation = new Animation("bounce", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

	let t = 0;               //timed frame to add in calculation
	let frame = 0            //frame to add in keyframe
	let acceleration = -9.8; // gravity
	let firstImpact = false; //start direction: Down
	let tImpact = -1;        //t that the object impacted the ground

	let keyFrames:Array<{ frame: number, value: number }> = [];
	//#endregion

	//put a time limit of 2000 frames, just for safety
	for(let height = amplitude;frame <2000 ;frame++, t+=1/frameRate){

        //before first impact only calculate the downward velocity
		if(!firstImpact){
			height = amplitude + (acceleration/2)*(t*t)
		}
        //after first impact calculate the impact frame and subtract the velocity 
		else{
			height =  -acceleration*tImpact*bounceFactor*t +  (acceleration/2)*(t*t);
		}
		
		//if it hit the ground
		if(height<=0){
			height=0;
			tImpact = !firstImpact ? t: t/2;
			t = 0;
			firstImpact = true;
		}
		height+=objHeight
        //check if the mesh stoped. 0.001 is an error factor to prevent it enter an infinite loop
        //when the bouncefactor was too hight to complete stop the mesh
		if(height == objHeight && keyFrames[keyFrames.length-1].value - height <0.001){
			break;
		}

		keyFrames.push({
			frame: frame,
			value: height,
		});

	}

	//set duration of the animation to param "duration"
	animation.framePerSecond = Math.round(1000*frame/duration);

	//set keyframes of animation
	animation.setKeys(keyFrames);

	//discard older animations
	node.animations.length>0? node.animations[0] = animation: node.animations.push(animation);
	
	//start animation
	node._scene.beginAnimation(node, 0, frame, false);

}
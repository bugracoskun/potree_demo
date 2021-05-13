Vue.component('home', {
	data:function(){
		return this.setDefault();
  },
  methods:{
      setDefault:function(){
          // Inputs
          return {
              onoff:true,
              sample:1
          }
      },
      open:function(id){
          var that=this;
        this.onoff = true;
        that.sample=BC.samples[id-1];

        
        var myNode = document.getElementById("potree_render_area");
        myNode.innerHTML = '';
        var cesium_div='<div id="cesiumContainer" style="position: absolute; width: 100%; height: 100%; background-color:green"></div>';
        var temp = document.createElement('div');
        temp.innerHTML = cesium_div;
        var cesium_obj = temp.firstChild;
        myNode.appendChild(cesium_obj);

        var myNode2 = document.getElementById("potree_sidebar_container");
        myNode2.innerHTML = '';
        

        window.viewer = new Potree.Viewer(document.getElementById("potree_render_area"),{useDefaultRenderLoop: false});

        viewer.setEDLEnabled(true);
		viewer.setFOV(60);
		viewer.setPointBudget(1_000_000);
		viewer.loadSettingsFromURL();
		
		viewer.setDescription("Loading Octree of LAS files");

        viewer.loadGUI(() => {
			viewer.setLanguage('en');
			$("#menu_appearance").next().show();

            var elem=document.getElementById("sampletable");
            
            for (var i = 0; i < BC.samples.length; i++) {
                var row = document.createElement("tr");
                var cell = document.createElement("td");
                var cell2 = document.createElement("td");
                var cell3 = document.createElement("td");
                var btn = "<td id='mybutton' data-label='onoff' style='text-align: center;'><button onclick='BC.openProject("+BC.samples[i].id+")' class='mini ui green button'>Open Project</button></td>";
                
                var cellText = document.createTextNode(BC.samples[i].name);
                var cellText2 = document.createTextNode(BC.samples[i].id);

                cell.appendChild(cellText);
                cell2.appendChild(cellText2);

                var temp = document.createElement('div');
                temp.innerHTML = btn;
                var htmlObject = temp.firstChild;

                cell3.appendChild(htmlObject);
                row.appendChild(cell);
                row.appendChild(cell2);
                row.appendChild(cell3);
                elem.appendChild(row);
            }
		});

        if(that.sample.type=="cloud"){
            Potree.loadPointCloud("src/data/sample"+that.sample.id+"/cloud.js", "lion", function(e){
                viewer.scene.addPointCloud(e.pointcloud);
                
                let material = e.pointcloud.material;
                material.size = 1;
                material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
                
                e.pointcloud.position.x += 3;
                e.pointcloud.position.y -= 3;
                e.pointcloud.position.z += 4;
                
                viewer.fitToScreen();
            });
        }else if(that.sample.type=="project"){
            viewer.loadProject("src/data/sample"+that.sample.id+"/sample"+that.sample.id+".json").then( () => {
                //console.log("project loaded");
            });
        }else if(that.sample.type=="url"){
            viewer.setBackground(null);
            viewer.setMinNodeSize(50);
            //viewer.useHQ = true;

            window.cesiumViewer = new Cesium.Viewer('cesiumContainer', {
                useDefaultRenderLoop: false,
                animation: false,
                baseLayerPicker : false,
                fullscreenButton: false, 
                geocoder: false,
                homeButton: false,
                infoBox: false,
                sceneModePicker: false,
                selectionIndicator: false,
                timeline: false,
                navigationHelpButton: false,
                imageryProvider : Cesium.createOpenStreetMapImageryProvider({url : 'https://a.tile.openstreetmap.org/'}),
                terrainShadows: Cesium.ShadowMode.DISABLED,
            });
        
            let cp = new Cesium.Cartesian3(4303414.154026048, 552161.235598733, 4660771.704035539);
            cesiumViewer.camera.setView({
                destination : cp,
                orientation: {
                    heading : 10, 
                    pitch : -Cesium.Math.PI_OVER_TWO * 0.5, 
                    roll : 0.0 
                }
            });
            
            Potree.loadPointCloud("http://5.9.65.151/mschuetz/potree/resources/pointclouds/riegl/retz/cloud.js", "Retz", function(e){
                let scene = viewer.scene;
                
                scene.addPointCloud(e.pointcloud);
                
                e.pointcloud.position.set(569277.402752, 5400050.599046, 0);
                e.pointcloud.rotation.set(0, 0, -0.035);

                let material = e.pointcloud.material;
                material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
                material.size = 0.7;
                material.elevationRange = [0, 70];
                material.weightRGB = 1.0;
                material.weightElevation = 1.0;
                
                scene.view.position.set(570975.577, 5398630.521, 1659.311);
                scene.view.lookAt(570115.285, 5400866.092, 30.009);

                {
                    let aTownHall = new Potree.Annotation({
                        position: [569879.768, 5400886.182, 80.691],
                        title: "Town Hall",
                        cameraPosition: [569955.329, 5400822.949, 98.807],
                        cameraTarget: [569879.768, 5400886.182, 46.691]
                    });
                    scene.annotations.add(aTownHall);

                    let aTrainStation = new Potree.Annotation({
                        position: [570337.407, 5400522.730, 30],
                        title: "Train Station",
                        cameraPosition: [570377.074, 5400427.884, 100.576],
                        cameraTarget: [570337.407, 5400522.730, 18.595]
                    });
                    scene.annotations.add(aTrainStation);

                    { // Attribute Selector Annotation

                        // Create title element with jquery
                        let elTitle = $(`
                            <span>
                                Attribute:
                                <img title="Elevation" name="action_elevation" src="${Potree.resourcePath}/icons/profile.svg" class="annotation-action-icon"/>
                                <img title="RGB and Elevation" name="action_both" src="${Potree.resourcePath}/icons/rgb_elevation.png" class="annotation-action-icon"/>
                                <img title="RGB" name="action_rgb" src="${Potree.resourcePath}/icons/rgb.svg" class="annotation-action-icon"/>
                            </span>`);
                        elTitle.find("img[name=action_elevation]").click( () => {
                            scene.pointclouds.forEach( pc => pc.material.activeAttributeName = "elevation" );
                        });
                        elTitle.find("img[name=action_rgb]").click( () => {
                            scene.pointclouds.forEach( pc => pc.material.activeAttributeName = "rgba" );
                        });
                        elTitle.find("img[name=action_both]").click( () => {
                            scene.pointclouds.forEach( pc => pc.material.activeAttributeName = "composite" );
                        });

                        // Give the annotation a meaningful string representation for the sidebar
                        elTitle.toString = () => "Color Setting";

                        // Same as with other annotations, except title is a jquery object this time.
                        let aActions = new Potree.Annotation({
                            position: [569222.340, 5401213.625, 227],
                            title: elTitle
                        });
                        scene.annotations.add(aActions);
                    }

                    { // Attribute Selector Annotation

                        let elTitle = $(`
                            <span>
                                Quality:
                                <span name="low"  style="font-family: monospace; margin-left: 4px">low</span>
                                <span name="med"  style="font-family: monospace; margin-left: 4px">med</span>
                                <span name="high" style="font-family: monospace; margin-left: 4px">high</span>
                            </span>`);
                        
                        elTitle.find("span").mouseover( (e) => {
                            $(e.target).css("filter", "drop-shadow(0px 0px 1px white)");
                        }).mouseout( (e) => {
                            $(e.target).css("filter", "");
                        });

                        elTitle.find("span[name=low]").click( () => {
                            viewer.setPointBudget(1_000_000);
                            viewer.useHQ = false;
                        });

                        elTitle.find("span[name=med]").click( () => {
                            viewer.setPointBudget(3_000_000);
                            viewer.useHQ = false;
                        });

                        elTitle.find("span[name=high]").click( () => {
                            viewer.setPointBudget(4_000_000);
                            viewer.useHQ = true;
                        });

                        // Give the annotation a meaningful string representation for the sidebar
                        elTitle.toString = () => "Quality Setting";

                        // Same as with other annotations, except title is a jquery object this time.
                        let aActions = new Potree.Annotation({
                            position: [570274.902, 5401873.626, 227],
                            title: elTitle
                        });
                        scene.annotations.add(aActions);
                    }
                }
                

                //let pointcloudProjection = e.pointcloud.projection;
                let pointcloudProjection = "+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
                let mapProjection = proj4.defs("WGS84");

                window.toMap = proj4(pointcloudProjection, mapProjection);
                window.toScene = proj4(mapProjection, pointcloudProjection);
                
                {
                    let bb = viewer.getBoundingBox();

                    let minWGS84 = proj4(pointcloudProjection, mapProjection, bb.min.toArray());
                    let maxWGS84 = proj4(pointcloudProjection, mapProjection, bb.max.toArray());
                }
            });

            function loop(timestamp){
                requestAnimationFrame(loop);
        
                viewer.update(viewer.clock.getDelta(), timestamp);
        
                viewer.render();
        
                if(window.toMap !== undefined){
        
                    {
                        let camera = viewer.scene.getActiveCamera();
        
                        let pPos		= new THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorld);
                        let pRight  = new THREE.Vector3(600, 0, 0).applyMatrix4(camera.matrixWorld);
                        let pUp		 = new THREE.Vector3(0, 600, 0).applyMatrix4(camera.matrixWorld);
                        let pTarget = viewer.scene.view.getPivot();
        
                        let toCes = (pos) => {
                            let xy = [pos.x, pos.y];
                            let height = pos.z;
                            let deg = toMap.forward(xy);
                            let cPos = Cesium.Cartesian3.fromDegrees(...deg, height);
        
                            return cPos;
                        };
        
                        let cPos = toCes(pPos);
                        let cUpTarget = toCes(pUp);
                        let cTarget = toCes(pTarget);
        
                        let cDir = Cesium.Cartesian3.subtract(cTarget, cPos, new Cesium.Cartesian3());
                        let cUp = Cesium.Cartesian3.subtract(cUpTarget, cPos, new Cesium.Cartesian3());
        
                        cDir = Cesium.Cartesian3.normalize(cDir, new Cesium.Cartesian3());
                        cUp = Cesium.Cartesian3.normalize(cUp, new Cesium.Cartesian3());
        
                        cesiumViewer.camera.setView({
                            destination : cPos,
                            orientation : {
                                direction : cDir,
                                up : cUp
                            }
                        });
                        
                    }
        
                    let aspect = viewer.scene.getActiveCamera().aspect;
                    if(aspect < 1){
                        let fovy = Math.PI * (viewer.scene.getActiveCamera().fov / 180);
                        cesiumViewer.camera.frustum.fov = fovy;
                    }else{
                        let fovy = Math.PI * (viewer.scene.getActiveCamera().fov / 180);
                        let fovx = Math.atan(Math.tan(0.5 * fovy) * aspect) * 2
                        cesiumViewer.camera.frustum.fov = fovx;
                    }
                    
                }
        
                cesiumViewer.render();

                var widget=document.getElementsByClassName("cesium-widget")[0];
                if(widget){
                    widget.style.height="100%";
                }
                
            }
        
            requestAnimationFrame(loop);
        }
        
        
      },
      close:function(e){
        this.onoff = false;
      },
      openlocal:function(id){
        var myNode = document.getElementById("potree_render_area");
        myNode.innerHTML = '';
        var cesium_div='<div id="cesiumContainer" style="position: absolute; width: 100%; height: 100%; background-color:green"></div>';
        var temp = document.createElement('div');
        temp.innerHTML = cesium_div;
        var cesium_obj = temp.firstChild;
        myNode.appendChild(cesium_obj);

        var myNode2 = document.getElementById("potree_sidebar_container");
        myNode2.innerHTML = '';

        window.viewer = new Potree.Viewer(document.getElementById("potree_render_area"));

        viewer.setEDLEnabled(true);
		viewer.setFOV(60);
		viewer.setPointBudget(1_000_000);
		viewer.loadSettingsFromURL();
		
		viewer.setDescription("Loading Octree of LAS files");

        viewer.loadGUI(() => {
			viewer.setLanguage('en');
			$("#menu_appearance").next().show();

            var elem=document.getElementById("sampletable");
            
            for (var i = 0; i < BC.samples.length; i++) {
                var row = document.createElement("tr");
                var cell = document.createElement("td");
                var cell2 = document.createElement("td");
                var cell3 = document.createElement("td");
                var btn = "<td id='mybutton' data-label='onoff' style='text-align: center;'><button onclick='BC.openProject("+BC.samples[i].id+")' class='mini ui green button'>Open Project</button></td>";
                
                var cellText = document.createTextNode(BC.samples[i].name);
                var cellText2 = document.createTextNode(BC.samples[i].id);

                cell.appendChild(cellText);
                cell2.appendChild(cellText2);

                var temp = document.createElement('div');
                temp.innerHTML = btn;
                var htmlObject = temp.firstChild;

                cell3.appendChild(htmlObject);
                row.appendChild(cell);
                row.appendChild(cell2);
                row.appendChild(cell3);
                elem.appendChild(row);
            }
		});

        Potree.loadPointCloud(BC.config.api+"/data/"+id+"/cloud.js", "lion", function(e){
            viewer.scene.addPointCloud(e.pointcloud);
            
            let material = e.pointcloud.material;
            material.size = 1;
            material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
            
            e.pointcloud.position.x += 3;
            e.pointcloud.position.y -= 3;
            e.pointcloud.position.z += 4;
            
            viewer.fitToScreen();
        });
      }
  },
  template:
  '<div v-if="onoff">'+
    '<div class="potree_container" style="position: absolute; width: calc(100%); height: 100%; left: 0px; top: 0px; ">'+
		'<div id="potree_render_area" style="background-image: url(\'src/img/waiting.jpg\'); background-size: contain;">'+
            '<div id="cesiumContainer" style="position: absolute; width: 100%; height: 100%; background-color:green"></div>'+
        '</div>'+
		'<div id="potree_sidebar_container"></div>'+
	'</div>'+
  '</div>'
  });

var home = new Vue({ el: '#home' });
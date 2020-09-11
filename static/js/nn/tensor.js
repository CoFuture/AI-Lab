//这是神经网络常用可视化操作的实现文件
import * as THREE from "../libs/three.module.js"

//添加神经元隐藏层
function addNeuralLayer(scene, dimensionX, dimensionY, channels = 1, axisPosition = 0, layerType = 0) {

    const geometry = new THREE.SphereBufferGeometry(0.5, 16, 16);
    let material;

    if (layerType === 0)
        material = new THREE.MeshBasicMaterial({color: 0x0099FF});
    else
        material = new THREE.MeshBasicMaterial({color: 0x8FBC8F});

    const division = 2;       //神经元间距

    //计算神经元总数
    let neural_count = dimensionX * dimensionY;

    //计算坐标系偏置量
    let x_bias = (dimensionX - 1) * division / 2;
    let y_bias = (dimensionY - 1) * division / 2;

    //同层神经元的InstanceMesh
    let layer_mesh = new THREE.InstancedMesh(geometry, material, neural_count);
    scene.add(layer_mesh);

    //建立位置缓存
    layer_mesh.instancePosition = [];

    //实例化神经元
    let neural_node = new THREE.Object3D();
    //神经元矩阵索引
    let matrix_index = 0;
    for (let i = 0; i < dimensionX; i++) {
        for (let j = 0; j < dimensionY; j++) {

            let position_x = division * i - x_bias;
            let position_y = -division * j + y_bias;
            neural_node.position.set(position_x, position_y, axisPosition);
            neural_node.updateMatrix();

            //写入position缓存
            layer_mesh.instancePosition.push(new THREE.Vector3(position_x, position_y, axisPosition));

            layer_mesh.setMatrixAt(matrix_index++, neural_node.matrix);
        }
    }

    //添加辅助框
    let layer_box = new THREE.Box3();
    layer_box.setFromCenterAndSize(new THREE.Vector3(0, 0, axisPosition),
        new THREE.Vector3(dimensionX * division + 3, dimensionY * division + 3, 4));

    let helper = new THREE.Box3Helper(layer_box, 0x000000);
    scene.add(helper);

    let text_position = {
        x: 0,
        y: (dimensionY / 2 + 4) * division,
        z: axisPosition
    };

    let text = {
        title: "神经元层",
        text_dimension: String(dimensionX) + "*" + String(dimensionY)
            + "*" + String(channels)
    }

    addSpriteText(scene, text, text_position, 0);

    //返回神经元层的id
    return layer_mesh.id;
}

//添加卷积层
//需要的参数：场景scene，维度x和y，通道数channel，卷积核个数，步长stride，游标位置，颜色类型
function addConvLayer(scene, dimensionX, dimensionY, channels = 1,
                      stride = 1, axisPosition = 0, layerType = 0) {

    let material, geometry;
    if (channels === 1)
        geometry = new THREE.PlaneBufferGeometry(6, 6, 1, 1);
    else
        geometry = new THREE.BoxBufferGeometry(6, 6, Math.min(channels, 3));


    if (layerType === 0)
        material = new THREE.MeshBasicMaterial({color: 0x5F9EA0, side: THREE.DoubleSide});
    else
        material = new THREE.MeshBasicMaterial({color: 0x3CB371, side: THREE.DoubleSide});

    const division = Math.min(6 + channels, 9);       //神经元间距

    //计算神经元总数
    let kernel_count = dimensionX * dimensionY;

    //计算坐标系偏置量
    let x_bias = (dimensionX - 1) * division / 2;
    let y_bias = (dimensionY - 1) * division / 2;

    //同层神经元的InstanceMesh
    let kernel_mesh = new THREE.InstancedMesh(geometry, material, kernel_count);
    scene.add(kernel_mesh);

    //建立位置缓存
    kernel_mesh.instancePosition = [];

    //实例化神经元
    let kernel_node = new THREE.Object3D();
    //神经元矩阵索引
    let matrix_index = 0;
    for (let i = 0; i < dimensionX; i++) {
        for (let j = 0; j < dimensionY; j++) {

            let position_x = division * i - x_bias;
            let position_y = -division * j + y_bias;
            kernel_node.position.set(position_x, position_y, axisPosition);
            kernel_node.updateMatrix();

            kernel_mesh.instancePosition.push(new THREE.Vector3(position_x, position_y, axisPosition));

            kernel_mesh.setMatrixAt(matrix_index++, kernel_node.matrix);
        }
    }

    //添加辅助框
    let layer_box = new THREE.Box3();
    let layer_box_center = new THREE.Vector3(0, 0, axisPosition);
    let layer_box_size = new THREE.Vector3(dimensionX * division, dimensionY * division, Math.min(channels, 3) + 4);

    layer_box.setFromCenterAndSize(layer_box_center, layer_box_size);
    let helper = new THREE.Box3Helper(layer_box, 0x000000);
    scene.add(helper);

    let text_position = {
        x: 0,
        y: (dimensionY / 2 + 1) * division,
        z: axisPosition
    };

    let text = {
        title: "卷积层",
        text_dimension: String(dimensionX) + "*" + String(dimensionY)
            + "*" + String(channels)
    }

    //添加文字标识
    addSpriteText(scene, text, text_position, 1);

    //返回卷积层id
    return kernel_mesh.id;
}

//添加池化层
//参数 场景，维度x，维度y，步长stride，类型type
function addPoolLayer(scene, dimensionX, dimensionY, stride = 0, type = "max", axisPosition = 0) {
    if (type !== "max" && type !== "mean") {
        console.log("unknown pooling type");
    } else {
        const geometry = new THREE.CircleBufferGeometry(3, 16);
        let material;

        if (type === "max")
            material = new THREE.MeshBasicMaterial({color: 0xE9967A, side: THREE.DoubleSide});
        else
            material = new THREE.MeshBasicMaterial({color: 0x2E8B57, side: THREE.DoubleSide});

        let pool_count = dimensionX * dimensionY;
        const division = 7;

        let x_bias = (dimensionX - 1) * division / 2;
        let y_bias = (dimensionY - 1) * division / 2;

        //同层神经元的InstanceMesh
        let pool_mesh = new THREE.InstancedMesh(geometry, material, pool_count);
        pool_mesh.name = ""
        scene.add(pool_mesh);

        //建立位置缓存
        pool_mesh.instancePosition = [];

        //实例化池化元
        let pool_node = new THREE.Object3D();
        //池化元矩阵的索引
        let matrix_index = 0;
        for (let i = 0; i < dimensionX; i++) {
            for (let j = 0; j < dimensionY; j++) {

                let position_x = division * i - x_bias;
                let position_y = -division * j + y_bias;
                pool_node.position.set(position_x, position_y, axisPosition);
                pool_node.updateMatrix();

                pool_mesh.instancePosition.push(new THREE.Vector3(position_x, position_y, axisPosition));
                pool_mesh.setMatrixAt(matrix_index++, pool_node.matrix);
            }
        }

        //添加辅助框
        let layer_box = new THREE.Box3();
        layer_box.setFromCenterAndSize(new THREE.Vector3(0, 0, axisPosition),
            new THREE.Vector3(dimensionX * division, dimensionY * division, 4));

        let helper = new THREE.Box3Helper(layer_box, 0x000000);
        scene.add(helper);

        //添加文本标识
        let text_position = {
            x: 0,
            y: (dimensionY / 2 + 1) * division,
            z: axisPosition
        };

        let text = {
            title: "池化层" + " " + type,
            text_dimension: String(dimensionX) + "*" + String(dimensionY)
        }

        //添加文字标识
        addSpriteText(scene, text, text_position, 2);

        return pool_mesh.id;
    }
}

//添加文字精灵
//需要的参数 scene，文本结构体，位置，颜色类型
//text:{title:"cov", dimension:"4x4x3"}
function addSpriteText(scene, text, text_position, text_type = -1) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    //解析文本结构体 长度 换行
    console.log(text.title, text.text_dimension);
    let max_length = Math.max(text.title.length, text.text_dimension.length);
    canvas.width = max_length * 40 + 40;
    canvas.height = 120;
    //制作矩形

    //解析类型确定背景和字体颜色
    if (text_type === 0)
        ctx.fillStyle = "rgba(65,105,225,0.6)";  //神经元层
    else if (text_type === 1)
        ctx.fillStyle = "rgba(60,179,113,0.6)";  //卷积层
    else if (text_type === 2)
        ctx.fillStyle = "rgba(240,128,128,0.6)";  //池化层
    else
        ctx.fillStyle = "rgba(255,165,0,0.6)";  //其他层

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText(text.title, 20, 50);
    ctx.fillStyle = "#696969"
    ctx.fillText(text.text_dimension, 20, 100);


    let url = canvas.toDataURL('image/png');
    let texture = THREE.ImageUtils.loadTexture(url);

    let spriteMaterial = new THREE.SpriteMaterial({map: texture});
    let sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(text_position.x, text_position.y, text_position.z);
    sprite.scale.set(12, 6, 1);
    scene.add(sprite);
}


//添加节点连线边,需要输入与前层的连接关系

//添加连接关系
//针对一连多的全连接关系
function addConnection(scene, pre_layer_id, cur_layer_id) {
    //todo type check
    let layer1 = scene.getObjectById(pre_layer_id);
    let layer2 = scene.getObjectById(cur_layer_id);

    let layer1_count = layer1.count;
    let layer2_count = layer2.count;

    let material = new THREE.LineBasicMaterial({color: 0x778899});
    let geometry = new THREE.BufferGeometry();

    // let line_group = new THREE.BufferGeometry();
    let points = [];

    // let line_mesh = new THREE.InstancedMesh()

    let random_node = Math.floor(Math.random() * layer1_count);

    for (let i = 0; i < layer2_count; i++) {
        let node1_position = layer1.instancePosition[random_node];
        let node2_position = layer2.instancePosition[i];

        points.push(node1_position.x, node1_position.y, node1_position.z);
        points.push(node2_position.x, node2_position.y, node2_position.z);

        // geometry.setFromPoints(points);
        // let line = new THREE.Line(geometry, material);

        // scene.add(line);

    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.computeBoundingSphere();

    let connect_line = new THREE.Line(geometry, material);
    scene.add(connect_line);

    // let lines = new THREE.Mesh(line_group, material);
    // console.log("----lines----", lines);
    // scene.add(lines);

}

//添加连接关系
//针对一对一连接，适用于神经元——卷积层和神经元——池化
//layer: id:1 dimension:
function addConnectionEqual(scene, pre_layer, cur_layer) {
    let layer1 = scene.getObjectById(pre_layer.id);
    let layer2 = scene.getObjectById(cur_layer.id);

    let layer1_dy = pre_layer.dimension_y;
    //获取卷积层或者池化层的dimension
    let layer2_dx = cur_layer.dimension_x;
    let layer2_dy = cur_layer.dimension_y;

    let material = new THREE.LineBasicMaterial({color: 0x778899});

    // let line_group = new THREE.BufferGeometry();
    let points = [];

    // let line_mesh = new THREE.InstancedMesh()

    for (let i = 0; i < layer2_dx; i++) {
        for (let j = 0; j < layer2_dy; j++) {
            let node1_position = layer1.instancePosition[i * layer1_dy + j];
            let node2_position = layer2.instancePosition[i * layer2_dy + j];

            points.push(node1_position);
            points.push(node2_position);

            let geometry = new THREE.BufferGeometry();
            geometry.setFromPoints(points);
            let line = new THREE.Line(geometry, material);

            scene.add(line);
            points = [];
        }
    }
}

export {addNeuralLayer, addConvLayer, addPoolLayer, addConnection, addConnectionEqual};
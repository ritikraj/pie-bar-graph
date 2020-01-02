class AwesomeGraph {
    constructor(id, segments) {
        this.canvasWidth = 300;
        this.canvasHeight = 300;
        this.context = null;
        this.radius = 85;
        this.center = 150;


        this.foreground = "";
        this.background = "";

        this.segments = 5;
        this.totalAngle = 1.5 * Math.PI;
        this.maxArea = 80;
        this.thickness = this.maxArea - 40;
        this.spacer = 0.03;
        this.maxValue = 900;
        this.animationProps = [];
        this.labels = [];
        this.firstBuild = true;

        this.init(id, {segments: segments ? segments : this.segments});
    }

    calculate(data, thickness = this.maxArea) {
        if (Array.isArray(data)) {
            let newArr = [];
            for (let i = 0; i < this.segments; i++) {
                newArr.push(thickness * data[i] / this.maxValue);
            }
            return newArr;
        } else return (data / this.maxValue * this.totalAngle);
    }

    changeValuesToPoints(array) {
        let coordinates = [];
        let a, b, v, angle;
        for (let i = 0; i < this.segments; i++) {
            v = array[i] * this.radius / this.maxValue;
            angle = (1.5 * Math.PI) + i * (2 * Math.PI / this.segments);
            a = Math.abs(this.center + v * Math.cos(angle));
            b = Math.abs(this.center + v * Math.sin(angle));
            coordinates.push({x: a, y: b});
        }
        return coordinates;
    }

    drawSegmentedCircles(color, array = 0, radius = this.radius, area = this.maxArea) {
        let startAngle = 0.5 * Math.PI;
        for (let i = 0; i < this.segments; i++) {
            let width = this.totalAngle / this.segments;
            let endAngle = startAngle + width - this.spacer;
            this.context.beginPath();
            if (array === 0) this.context.arc(this.center, this.center, radius, startAngle, endAngle);
            else this.context.arc(this.center, this.center, radius + (array[i] === 0 ? 0.1 : array[i]) / 2 - area / 2, startAngle, endAngle);
            startAngle = endAngle + this.spacer;
            this.context.strokeStyle = color;
            if (array === 0) this.context.lineWidth = area;
            else this.context.lineWidth = array[i] === 0 ? 0.1 : array[i];
            this.context.stroke();
            this.context.closePath();
        }
    }

    drawAThreeQuarterCircle(color, radius = this.radius, value = this.totalAngle, thickness = this.thickness) {
        let startAngle = 0.5 * Math.PI;
        this.context.beginPath();
        this.context.arc(this.center, this.center, radius, startAngle, startAngle + value);
        this.context.strokeStyle = color;
        this.context.lineWidth = thickness;
        this.context.stroke();
        this.context.closePath();
    }

    drawFullCircle(radius, strokeColor, strokeWidth) {
        this.context.beginPath();
        this.context.arc(this.center, this.center, radius, 0, 2 * Math.PI);
        this.context.strokeStyle = strokeColor;
        this.context.lineWidth = strokeWidth;
        this.context.stroke();
        this.context.closePath();
    }

    drawPolygon(color, width, coordinates) {
        this.context.beginPath();
        for (let i = 0; i < coordinates.length; i++) {
            this.context.moveTo(coordinates[i].x, coordinates[i].y);
            if (i === coordinates.length - 1) this.context.lineTo(coordinates[0].x, coordinates[0].y);
            else this.context.lineTo(coordinates[i + 1].x, coordinates[i + 1].y);
            this.context.strokeStyle = color;
            this.context.lineWidth = width;
            this.context.stroke();
        }
        this.context.closePath();
    }

    animatePie(time, total = true) {
        let props = [], a = [];
        for (let i = 0; i < this.animationProps.length; i++) {
            if (!Array.isArray(this.animationProps[i])) {
                props.push(this.animationProps[i]);
                a.push(0);
            }
        }
        const animation = () => {
            this.context.clearRect(0, 0, 300, 300);
            props.forEach((prop, index) => {
                a[index] = a[index] + prop / time;
            });
            let anim = true;
            a.forEach((ai, index) => {
                if (ai > props[index]) anim = false;
            });
            this.showTotal();
            this.showType();
            if (anim) {
                this.build(...a);
                window.requestAnimationFrame(animation);
            } else this.build(...props);
        };
        animation();
    }

    animatePolyAndBarGraph(time, total = true) {
        let arrays = [], a = [];
        for (let i = 0; i < this.animationProps.length; i++) {
            if (Array.isArray(this.animationProps[i])) {
                arrays.push(this.animationProps[i]);
            }
        }
        const animation = () => {
            this.context.clearRect(0, 0, 300, 300);
            arrays.forEach((props, i) => {
                props.forEach((prop, index) => {
                    prop = prop === 0 ? 0.1 : prop;
                    a.push(0);
                    a[index] = a[index] + prop / (time);
                });
                let anim = true;
                a.forEach((ai, index) => {
                    if (ai > props[index]) anim = false;
                });
                if (anim) {
                    this.build(a);
                    window.requestAnimationFrame(animation);
                } else this.build(props);
                this.setLabels(this.labels);
                this.showTotal();
                this.showType();
            });
        };
        animation();
    }

    setMaxValue(maxValue) {
        this.maxValue = maxValue;
    }

    setLabels() {
    }

    showTotal() {
    }

    showTotalMethod(total, position) {
        let font = "Roboto, sans-serif";
        let average = 0;
        total.map(item => average = average + item);
        average = parseInt(average/total.length);
        this.context.font = "normal normal bold 40px " + font;
        this.context.fillStyle = "#000";
        if (position === "center") {
            this.context.textAlign = "center";
            this.context.fillText(average, 150, 160);
            this.context.font = "normal normal 300 20px " + font;
            this.context.fillText("/ " + this.maxValue, 160, 185);
        }
        if (position === "bottom") {
            this.context.fillText(average, 160, 240);
            this.context.font = "normal normal 300 20px " + font;
            this.context.fillText("/ "+this.maxValue, 180, 265);
        }

    }

    showType() {
    }

    showTypeMethod(data) {
        this.context.beginPath();
        this.context.fillStyle = this.foreground;
        this.context.lineWidth = 1;
        this.context.moveTo(144, 100);
        this.context.lineTo(156,100);
        this.context.quadraticCurveTo(160,100,160,104);
        this.context.lineTo(160,116);
        this.context.quadraticCurveTo(160,120,156,120);
        this.context.lineTo(144,120);
        this.context.quadraticCurveTo(140,120,140,116);
        this.context.lineTo(140,104);
        this.context.quadraticCurveTo(140,100,144,100);
        this.context.closePath();
        this.context.fill();
        this.context.fillStyle = "#FFF";
        this.context.font = "normal normal bold 14px Roboto";
        this.context.textAlign = "center";
        this.context.fillText(data, 150, 115);

    }

    build() {
    }

    init(id, props) {
        this.segments = props.segments;
        let canvas = document.createElement("canvas");
        document.getElementById(id).append(canvas);
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        this.context = canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
}

class TypeOne extends AwesomeGraph {
    constructor(id, segments) {
        super(id, segments);
        this.radius = this.radius + 5 ;
        this.maxArea = this.maxArea - 30;
        this.foreground = 'rgb(206, 136, 186)';
        this.background = 'rgb(245, 231, 241)';
    }

    setLabels(array, font = "Roboto") {
        this.labels = array;
        let width = this.totalAngle / this.segments;
        let angle = 0.5 * Math.PI + width / 2;
        let x, y;
        for (let i = 0; i < this.segments; i++) {
            x = Math.abs((this.radius + 43) * Math.cos(angle) + 150);
            y = Math.abs((this.radius + 43) * Math.sin(angle) + 155);
            this.context.font = "22px " + font;
            this.context.textAlign = "center";
            this.context.fillStyle = this.foreground;
            this.context.fillText(array[i], x, y);
            angle = angle + width;
        }
        return this;
    }

    build(array, foregroundColor = this.foreground, backgroundColor = this.background) {
        this.drawSegmentedCircles(backgroundColor);
        this.drawSegmentedCircles(foregroundColor, this.calculate(array));
        if (this.firstBuild) {
            this.firstBuild = false;
            this.animationProps.push(array);
        }
        this.showTotal();
        return this;
    }

    showTotal() {
        this.showTotalMethod(this.animationProps[0], "center");
    }

    showType() {
        this.showTypeMethod("A");
    }

    animate(time = 15) {
        this.animatePolyAndBarGraph(time);
        return this;
    }
}

class TypeTwo extends AwesomeGraph {
    constructor(id) {
        super(id);
        this.foreground = 'rgb(123, 146, 180)';
        this.background = 'rgb(229, 233, 240)';
    }

    build(value, backgroundColor = this.background, foregroundColor = this.foreground) {
        this.drawAThreeQuarterCircle(backgroundColor, this.radius + 10, this.totalAngle, this.maxArea - 20);
        this.drawAThreeQuarterCircle(foregroundColor, this.radius + 10, this.calculate(value), this.maxArea - 20);
        if (this.firstBuild) {
            this.firstBuild = false;
            this.animationProps.push(value);
        }
        this.showTotal();
        return this;
    }

    showType() {
        this.showTypeMethod("E");
    }

    showTotal() {
        this.showTotalMethod(this.animationProps, "center");
    }

    animate(time = 15) {
        this.animatePie(time);
        return this;
    }
}

class TypeThree extends AwesomeGraph {
    constructor(id, segments) {
        super(id, segments);
        this.foreground = 'rgb(245, 160, 78)';
        this.background = 'rgb(253, 236, 220)';
        this.outerThickness = this.maxArea - 40;
        this.innerThickness = this.maxArea - 55;
        this.outerRadius = this.radius + 20;
        this.innerRadius = this.radius - 20;
    }

    buildPie(pieChartValue, backgroundColor = this.background, foregroundColor = this.foreground) {
        this.drawAThreeQuarterCircle(backgroundColor, this.innerRadius, this.totalAngle, this.innerThickness);
        this.drawAThreeQuarterCircle(foregroundColor, this.innerRadius, this.calculate(pieChartValue), this.innerThickness);
    }

    buildSegmented(barGraphValue, backgroundColor = this.background, foregroundColor = this.foreground) {
        this.drawSegmentedCircles(backgroundColor, 0, this.outerRadius, this.outerThickness);
        this.drawSegmentedCircles(foregroundColor, this.calculate(barGraphValue, this.outerThickness), this.outerRadius, this.outerThickness);
    }

    buildPolygon(polygonValue, foregroundColor = this.foreground) {
        polygonValue = polygonValue.map(item => item / 2);
        this.drawPolygon(foregroundColor, 3, this.changeValuesToPoints(polygonValue));
    }

    build(barGraphValue, pieChartValue, polygonValue,
          backgroundColor = this.background,
          foregroundColor = this.foreground) {
        if (this.firstBuild) {
            this.firstBuild = false;
            this.animationProps.push(barGraphValue);
            this.animationProps.push(pieChartValue);
            this.animationProps.push(polygonValue);
        }
        this.buildPie(pieChartValue, backgroundColor, foregroundColor);
        this.buildSegmented(barGraphValue, backgroundColor, foregroundColor);
        this.buildPolygon(polygonValue, foregroundColor);
        this.showTotal();
        return this;
    }

    showTotal() {
        this.showTotalMethod(this.animationProps[0], "bottom");
    }

    animate(pieChartTime = 18, polygonBarGraphTime = 20) {
        let props = this.animationProps;
        let barAnimatedValues = [];
        let polygonAnimatedValues = [];
        let pieAnimatedValue = 0;
        let isAnimationPossible = [true, true, true];
        const animation = () => {
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            props[0].forEach((prop, index) => {
                prop = prop === 0 ? 0.1 : prop;
                barAnimatedValues.push(0);
                barAnimatedValues[index] = barAnimatedValues[index] + prop / (polygonBarGraphTime);
            });
            barAnimatedValues.forEach((value, index) => {
                if (value > props[0][index]) isAnimationPossible[0] = false;
            });
            pieAnimatedValue = pieAnimatedValue + props[1] / pieChartTime;
            if (pieAnimatedValue > props[1]) {
                isAnimationPossible[1] = false;
            }
            props[2].forEach((prop, index) => {
                prop = prop === 0 ? 0.1 : prop;
                polygonAnimatedValues.push(0);
                polygonAnimatedValues[index] = polygonAnimatedValues[index] + prop / (polygonBarGraphTime);
            });
            polygonAnimatedValues.forEach((value, index) => {
                if (value > props[2][index]) isAnimationPossible[2] = false;
            });

            if (isAnimationPossible[0] || isAnimationPossible[1] || isAnimationPossible[2]) {
                if (isAnimationPossible[0]) this.buildSegmented(barAnimatedValues);
                else this.buildSegmented(props[0]);
                if (isAnimationPossible[1]) this.buildPie(pieAnimatedValue);
                else this.buildPie(props[1]);
                if (isAnimationPossible[2]) this.buildPolygon(polygonAnimatedValues);
                else this.buildPolygon(props[2]);
                window.requestAnimationFrame(animation);
            } else {
                this.buildSegmented(props[0]);
                this.buildPie(props[1]);
                this.buildPolygon(props[2]);
            }
            this.showTotal(props[0], "bottom");
        };
        animation();
        return this;
    }
}

class TypeFour extends AwesomeGraph {
    constructor(id, segments) {
        super(id, segments);
        this.radius = 110;
        this.circleColor = 'rgb(1, 103, 143)';
        this.linesColor = 'rgb(226, 226, 228)';
        this.foregroundPolygonColor = 'rgb(103, 197, 202)';
        this.backgroundPolygonColor = 'rgb(249, 250, 252)';
    }

    drawLinesFromOrigin(color, width, coordinates) {
        this.context.beginPath();
        for (let i = 0; i < coordinates.length; i++) {
            this.context.moveTo(this.center, this.center);
            this.context.lineTo(coordinates[i].x, coordinates[i].y);
            this.context.strokeStyle = color;
            this.context.lineWidth = width;
            this.context.stroke();
        }
        this.context.closePath();
    }

    regularPolygonCoordinates() {
        let a, b, angle, coordinates = [];
        for (let i = 0; i < this.segments; i++) {
            angle = (1.5 * Math.PI) + i * (2 * Math.PI / this.segments);
            a = Math.abs(this.center + this.radius * Math.cos(angle));
            b = Math.abs(this.center + this.radius * Math.sin(angle));
            coordinates.push({x: parseInt(a), y: parseInt(b)});
        }
        return coordinates;
    }

    drawBackground(circlesColor, backgroundPolygonColor, linesColor) {
        for (let i = 0; i < 10; i++) {
            this.drawFullCircle(this.radius - 10 * i, circlesColor, 0.5)
        }
        let coordinates = this.regularPolygonCoordinates();
        this.drawPolygon(backgroundPolygonColor, 1, coordinates);
        this.drawLinesFromOrigin(linesColor, 2, coordinates);
    }

    insertValues(values, foregroundPolygonColor) {
        this.drawPolygon(foregroundPolygonColor, 5, this.changeValuesToPoints(values))
    }

    setLabels(array, font = "Roboto") {
        this.labels = array;
        let coordinates = this.regularPolygonCoordinates();
        for (let i = 0; i < this.segments; i++) {
            let shiftX = coordinates[i].x >= this.center ? 20 : -15;
            let shiftY = coordinates[i].y >= this.center ? 20 : -15;
            if (coordinates[i].x > this.center - 5 && coordinates[i].x < this.center + 5) shiftX = 0;
            if (coordinates[i].y > this.center - 5 && coordinates[i].y < this.center + 5) shiftY = 0;
            let x = coordinates[i].x + shiftX;
            let y = coordinates[i].y + shiftY;
            this.context.font = "22px " + font;
            this.context.fillStyle = this.foregroundPolygonColor;
            this.context.textAlign = "center";
            this.context.fillText(array[i], x, y);
        }
        return this;
    }

    build(values,
          circlesColor = this.circleColor,
          backgroundPolygonColor = this.backgroundPolygonColor,
          linesColor = this.linesColor,
          foregroundPolygonColor = this.foregroundPolygonColor) {

        this.drawBackground(circlesColor, backgroundPolygonColor, linesColor);
        this.insertValues(values, foregroundPolygonColor);
        if (this.firstBuild) {
            this.firstBuild = false;
            this.animationProps.push(values);
        }
        return this;
    }

    animate(time = 15) {
        this.animatePolyAndBarGraph(time, false);
        return this;
    }
}

class TypeFive extends AwesomeGraph {
    constructor(id, segments) {
        super(id, segments);
        this.radius = 120;
        this.gap = 47;
        this.backgroundColor = 'rgb(253, 236, 220)';
        this.foregroundColor = 'rgb(245, 160, 78)';
    }

    build(value1,
          value2,
          backgroundColor = this.backgroundColor,
          foregroundColor = this.foregroundColor) {
        if (this.firstBuild) {
            this.firstBuild = false;
            this.animationProps.push(value1);
            this.animationProps.push(value2);
        }
        this.drawAThreeQuarterCircle(backgroundColor);
        this.drawAThreeQuarterCircle(backgroundColor, this.radius - this.gap);
        this.drawAThreeQuarterCircle(foregroundColor, this.radius, this.calculate(value1));
        this.drawAThreeQuarterCircle(foregroundColor, this.radius - this.gap, this.calculate(value2));
        return this;
    }

    animate(time = 15) {
        this.animatePie(time, false);
        return this;
    }
}
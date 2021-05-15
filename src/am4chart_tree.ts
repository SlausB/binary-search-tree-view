/* Imports */
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected"; 
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import Streams from '@slaus/simple_streams/lib/space'
import { random_int } from './utils'
import { ForceDirectedTreeDataItem } from "@amcharts/amcharts4/plugins/forceDirected";

export default function am4chart_tree( streams : Streams ) {
    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end



    let chart = am4core.create("chartdiv", am4plugins_forceDirected.ForceDirectedTree);
    let networkSeries = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries())

    chart.data = [
        {
            name: "Core",
            children: [
                {
                    name: "First",
                    children: [
                        { name: "A1", value: 100 },
                        { name: "A2", value: 60 }
                    ]
                },
                {
                    name: "Second",
                    children: [
                        { name: "B1", value: 135 },
                        { name: "B2", value: 98 }
                    ]
                },
                {
                    name: "Third",
                    children: [
                        {
                            name: "C1",
                            children: [
                                { name: "EE1", value: 130 },
                                { name: "EE2", value: 87 },
                                { name: "EE3", value: 55 }
                            ]
                        },
                        { name: "C2", value: 148 },
                        {
                            name: "C3", children: [
                                { name: "CC1", value: 53 },
                                { name: "CC2", value: 30 }
                            ]
                        },
                        { name: "C4", value: 26 }
                    ]
                },
                {
                    name: "Fourth",
                    children: [
                        { name: "D1", value: 415 },
                        { name: "D2", value: 148 },
                        { name: "D3", value: 89 }
                    ]
                },
                {
                    name: "Fifth",
                    children: [
                        {
                            name: "E1",
                            children: [
                                { name: "EE1", value: 33 },
                                { name: "EE2", value: 40 },
                                { name: "EE3", value: 89 }
                            ]
                        },
                        {
                            name: "E2",
                            value: 148
                        }
                    ]
                }

            ]
        }
    ];

    networkSeries.dataFields.value = "value";
    networkSeries.dataFields.name = "name";
    networkSeries.dataFields.children = "children";
    networkSeries.nodes.template.tooltipText = "{name}:{value}";
    networkSeries.nodes.template.fillOpacity = 1;

    networkSeries.nodes.template.label.text = "{name}"
    networkSeries.fontSize = 10;

    networkSeries.links.template.strokeWidth = 1;

    let hoverState = networkSeries.links.template.states.create("hover");
    hoverState.properties.strokeWidth = 3;
    hoverState.properties.strokeOpacity = 1;

    networkSeries.nodes.template.events.on("over", function (event) {
        event.target.dataItem.childLinks.each(function (link) {
            link.isHover = true;
        })
        if (event.target.dataItem.parentLink) {
            event.target.dataItem.parentLink.isHover = true;
        }

    })

    networkSeries.nodes.template.events.on("out", function (event) {
        event.target.dataItem.childLinks.each(function (link) {
            link.isHover = false;
        })
        if (event.target.dataItem.parentLink) {
            event.target.dataItem.parentLink.isHover = false;
        }
    })

    streams.s( 'spacebar' ).on( () => {
        console.log( 'Adding random node ...' )
        console.log( 'Data:', chart.data )
        /*chart.addData({
            name : 'node',
            value : random_int( -100, 100 ),
        })*/
        chart.data[0].children.push({
            name : 'node',
            value : random_int( -100, 100 ),
        })
        chart.invalidateData()
    })
}

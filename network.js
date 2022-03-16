
function simulate(data, svg) {
    let width = parseInt(svg.attr("viewBox").split(' ')[2])
    let height = parseInt(svg.attr("viewBox").split(' ')[3])
    let main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")

    let scale_radius = d3.scaleSqrt()
        .domain(d3.extent(data.nodes, (d) => d.papers))
        .range([5, 30])

    let scale_link_stroke_width = d3.scaleLinear()
        .domain(d3.extent(data.links, function (d) { return d.papers }))
        .range([1, 5])

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let link_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke-width", function (d) {
            return scale_link_stroke_width(d.papers)
        });

    let node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${(height / 2)})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class", function (d) { return "gr_" + d.id.toString() })
        .on("mouseenter", function (m,d) {
            node_elements.classed("inactive", true);
            link_elements.classed("inactive", true);
            node_elements.filter((x) => d.id == x.id)
                .classed("inactive", false);
            link_elements.filter((y) => console.log(d.id))
            link_elements.filter((x) => x.source.id === d.id || x.target.id === d.id)
                .classed("inactive", false);
        })
        .on("mouseleave", function (d, data) {
            node_elements.classed("inactive", false)
            node_elements.classed("inactive", false)
        })
    node_elements.append("circle")
        .attr("r", (d) => scale_radius(d.papers))
        .attr("fill", (d) => color(d.id));

    node_elements.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.id })

    d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius(function (d) { return scale_radius(d.papers) * 4 }))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(data.links)
            .id(function (d) { return d.id })
            .distance(function (d) { return d.papers })
            .strength(function (d) { return d.papers * .1 })
        )
        .on("tick", ticked);

    function ticked() {

        node_elements
            .attr('transform', function (d) { return `translate(${d.x},${d.y})` })
        link_elements
            .attr("x1", function (d) { return d.source.x })
            .attr("x2", function (d) { return d.target.x })
            .attr("y1", function (d) { return d.source.y })
            .attr("y2", function (d) { return d.target.y })

    }


    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 2])
        .on("zoom", zoomed));
    function zoomed({ transform }) {
        main_group.attr("transform", transform);
    }




}

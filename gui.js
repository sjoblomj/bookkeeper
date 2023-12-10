class Gui {
    bookkeepingData; accountPlanData; modalRowNumber;

    constructor(bookkeepingData, accountPlanData) {
        this.bookkeepingData = bookkeepingData;
        this.accountPlanData = accountPlanData;
        this.modalRowNumber = 0;

        this.setBindings();
        this.handleAccountPlan(accountPlanData);
        this.handleBookkeeping(bookkeepingData);
    }

    setBindings = () => {
        let gui = this;
        document.getElementsByClassName("close")[0].onclick = () => {
            gui.closeModal();
        }
        window.onclick = function(event) {
            if (event.target === document.getElementById("modal")) {
                gui.closeModal();
            }
        }
        document.body.addEventListener('keydown', e => {
            if (e.key === "Escape") {
                gui.closeModal();
            }
        });
    }

    closeModal = () => {
        this.setModalHeader("modal-header modal-header-bg", "Edit");
        let modal = document.getElementById("modal");
        modal.style.display = "none";
    }

    setModalHeader = (classes, text) => {
        document.getElementsByClassName("modal-header")[0].className = classes;
        document.getElementById("modal-header-title").innerHTML = text;
    }

    save = (object) => {
        let sum = 0;
        for (let i = 0; i < this.modalRowNumber; i++) {
            let amount = 0;
            try {
                amount = +parseFloat(document.getElementById("amountinput" + i).value).toFixed(2);
            } catch (e) {
                console.log("ERROR " + i, e);
            }
            sum += amount;
        }
        if (Math.abs(object.amount) !== sum) {
            this.setModalHeader("modal-header modal-header-bg-error", "The amounts don't add up!");
            return 1;
        }
        this.closeModal();
        return 0;
    }

    validatenum = (id) => {
        let input = document.getElementById(id);
        if (!isNaN(input.value) && !isNaN(parseFloat(input.value))) {
            input.className = "";
            return true;
        }
        input.className = "input-error";
        return false;
    }

    addBalanceRow = (rownum, amount, date, debit, credit) => {
        let d = "", c = "";

        if (debit !== "" && credit !== "") {
            for (let i = 0; i < document.getElementById("account-plan").childElementCount && (d === "" || c === ""); i++) {
                let account = document.getElementById("account-plan").childNodes[i].value;
                if (account.startsWith(debit + " ")) {
                    d = account;
                }
                if (account.startsWith(credit + " ")) {
                    c = account;
                }
            }
        }

        let btn = document.getElementById("addrowbtn");
        if (btn) {
            btn.remove();
        }
        function insert(node) {
            document.getElementById("modal-grid").insertBefore(node, document.getElementById("modal-grid-saverow"));
        }

        btn = document.createElement("button");
        btn.id = "addrowbtn";
        btn.title = "Add row";
        btn.innerHTML = "➕";
        btn.onclick = () => this.addBalanceRow(this.modalRowNumber++, 0, date);

        let div;
        div = document.createElement("div");
        div.className = "modal-grid-addrow";
        div.appendChild(btn);
        insert(div);

        div = document.createElement("div");
        div.className = "modal-grid-label";
        div.innerHTML = "<label for='amountinput" + rownum + "'>Amount:</label>";
        insert(div);

        div = document.createElement("div");
        div.className = "modal-grid-amount";
        div.innerHTML = "<input type='number' id='amountinput" + rownum + "' name='amount' value='" + amount + "' onfocusout='this.validatenum(\"amountinput" + rownum + "\")'>";
        insert(div);

        div = document.createElement("div");
        div.className = "modal-grid-deblbl";
        div.innerHTML = "<label for='debit-choice" + rownum + "'>From (debit):</label>";
        insert(div);

        div = document.createElement("div");
        div.className = "modal-grid-deb";
        div.innerHTML = "<input list='account-plan' id='debit-choice" + rownum + "' name='debit-choice' value='" + d + "'/>";
        insert(div);

        div = document.createElement("div");
        div.className = "modal-grid-credlbl";
        div.innerHTML = "<label for='credit-choice" + rownum + "'>To (credit):</label>";
        insert(div);

        div = document.createElement("div");
        div.className = "modal-grid-cred";
        div.innerHTML = "<input list='account-plan' id='credit-choice" + rownum + "' name='credit-choice' value='" + c + "'/>";
        insert(div);

        div = document.createElement("div");
        div.className = "modal-grid-datelbl";
        div.innerHTML = "<label for='dateinput" + rownum + "'>Date:</label>";
        insert(div);

        div = document.createElement("div");
        div.className = "modal-grid-date";
        div.innerHTML = "<input type='text' id='dateinput" + rownum + "' name='date' value='" + date + "'>";
        insert(div);
    }

    handleBookkeeping = (data) => {
        let gui = this;
        const table = document.getElementById("bookkeeping");
        const th = document.createElement("tr");
        th.innerHTML = "<th>Id</th><th>Date</th><th>Amount</th><th>Message</th><th>Text</th><th>Notes</th><th>Edit</th>";
        table.appendChild(th);

        data.forEach(function(object) {
            const tr = document.createElement("tr");
            tr.onclick = () => {
                let desc = object.description !== undefined ? object.description : (object.notes !== "" ? object.notes : object.message);

                document.getElementById("modal-body").innerHTML =
                    "<pre>\n" + JSON.stringify(object, null, 2) + "\n</pre>" +
                    "<div id='modal-grid' class='modal-grid'>" +
                    "  <div class='modal-grid-addrow'>&nbsp;</div>" +
                    "  <div class='modal-grid-label'><label for='descinput'>Description:</label></div>" +
                    "  <div class='modal-grid-desc'> <input type='text' id='descinput' name='desc' value='" + desc + "'></div>" +
                    "  <div id='modal-grid-saverow' class='modal-grid-saverow'><button id='savebutton'>Save</button></div>" +
                    "</div>";

                if (!object.balance) {
                    gui.addBalanceRow(gui.modalRowNumber++, Math.abs(object.amount), object.date, "", "");
                } else {
                    object.balance.forEach(b => {
                        gui.addBalanceRow(gui.modalRowNumber++, b.amount, b.date, b.debit, b.credit);
                    });
                }
                let modal = document.getElementById("modal");
                modal.style.display = "block";

                document.getElementById("savebutton").onclick = () => gui.save(object);
                document.getElementById("descinput").focus();
                document.body.addEventListener('keydown', e => {
                    if (e.key === "Enter" && document.activeElement !== document.getElementById("addrowbtn") && modal.style.display !== "none") {
                        gui.save(object);
                    }
                });
            }
            tr.innerHTML =
                "<td>" + object.id + "</td>" +
                "<td>" + object.date + "</td>" +
                "<td class='" + object.category + "'>" + object.amount + "</td>" +
                "<td>" + object.message + "</td>" +
                "<td>" + object.name + "</td>" +
                "<td>" + (object.description !== undefined ? object.description : object.notes) + "</td>" +
                "<td>" + (object.description !== undefined ? "✅" : "❌") + "</td>" +
                "";
            table.appendChild(tr);
        });

        return data;
    }

    handleAccountPlan = (data) => {
        const table = document.getElementById("accountplan");
        const th = document.createElement("tr");
        th.innerHTML = "<th>Account Number</th><th>Name</th><th>Account Type</th>";
        table.appendChild(th);

        const dl = document.createElement("datalist");
        dl.id = "account-plan";
        document.body.appendChild(dl);

        data.forEach(function(object) {
            const tr = document.createElement("tr");
            tr.innerHTML =
                "<td>" + object.account_number + "</td>" +
                "<td>" + object.name + "</td>" +
                "<td>" + object.account_type + "</td>" +
                "";
            table.appendChild(tr);

            const o = document.createElement("option");
            o.value = "accountPlanNumberToName(object.account_number, data)";
            dl.appendChild(o);
        });
        return data;
    }

    switchtab = (tabName) => {
        // Get all elements with class="tabcontent" and hide them
        let tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Get all elements with class="tablinks" and remove the class "active"
        let tablinks = document.getElementsByClassName("tablinks");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(tabName + "div").style.display = "block";
        document.getElementById(tabName + "btn").className += " active";
    }
}

Promise.all([
    fetch("account_plan.json").then(x => x.text()),
    fetch("bookkeeping.json").then(x => x.text())
]).then(([accountPlan, bookkeeping]) => {
    let gui = new Gui(JSON.parse(bookkeeping), JSON.parse(accountPlan));
    gui.switchtab("bookkeeping");
    //accountList(bk, ap);
});

class Gui {
    bookkeepingData; accountPlanData; yearData;
    modalRowNumber = 0; modalGroupedVerificationsNumber = 0;

    formatter = new Intl.NumberFormat('sv-SE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    constructor(bookkeepingData, accountPlanData, yearData) {
        this.bookkeepingData = bookkeepingData;
        this.accountPlanData = accountPlanData;
        this.yearData = yearData;

        this.setBindings();
        this.handleAccountPlan();
        this.handleBookkeeping();
        this.handleAccountList();
    }

    createNumberCell = (num, showZero = true, c = "") => {
        let td = document.createElement("td");
        td.className = "numbercell " + (c ? c : (num >= 0 ? "positive" : "negative"));
        if (showZero || num !== 0)
            td.innerHTML = this.formatter.format(num);
        else
            td.innerHTML = "&nbsp;";
        return td;
    }

    setBindings = () => {
        let gui = this;
        document.getElementsByClassName("close")[0].onclick = () => {
            gui.closeModal();
        }
        window.onclick = (event) => {
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

    getVerification = id => {
        for (const data of this.bookkeepingData) {
            if (data.id === id)
                return data;
        }
        return undefined;
    }

    saveVerification = (verification) => {
        let description = document.getElementById("descinput").value.trim();
        let balance = [];

        // Validate Grouped Verifications
        let groupedVerifications = [];
        for (let i = 0; i < this.modalGroupedVerificationsNumber; i++) {
            let v = document.getElementById("groupedverification" + i).value.trim();
            if (v === "")
                continue;
            if (!this.validateVerification("groupedverification" + i)) {
                this.setModalHeader("modal-header modal-header-bg-error", "Invalid grouped verification");
                return 1;
            }
            if (verificationNameToNumber(v) === verification.id) {
                this.setModalHeader("modal-header modal-header-bg-error", "Cannot group verification with itself");
                return 1;
            }
            groupedVerifications.push(v);
        }

        // Validate input fields
        let sum = 0;
        for (let i = 0; i < this.modalRowNumber; i++) {
            let amount = 0, debit = 0, credit = 0;
            let date = "";
            try {
                let a = document.getElementById("amountinput" + i).value.trim();
                let d = document.getElementById("debit-choice" + i).value.trim();
                let c = document.getElementById("credit-choice" + i).value.trim();
                date = document.getElementById("dateinput" + i).value.trim();

                if ((a === "" || a === "0") && d === "" && c === "" && (date === "" || date === verification.date))
                    continue;
                amount = +parseFloat(a).toFixed(2);
                debit = Number(accountPlanNameToNumber(d));
                credit = Number(accountPlanNameToNumber(c));

                if (!this.validateNumber("amountinput" + i) ||
                    !this.validateAccount("debit-choice" + i) ||
                    !this.validateAccount("credit-choice" + i) ||
                    !this.validateDate("dateinput" + i)
                ) {
                    return 1;
                }
            } catch (e) {
                console.log("ERROR " + i, e);
            }
            balance.push({
                "date": date,
                "amount": amount,
                "debit": debit,
                "credit": credit
            })
            sum += amount;
        }

        if (verification.amount === undefined) {
            verification.amount = sum;
        } else if (Math.abs(verification.amount) !== sum) {
            this.setModalHeader("modal-header modal-header-bg-error", "The amounts don't add up!");
            return 1;
        }

        verification.description = description;
        verification.balance = balance;

        if (this.getVerification(verification.id) === undefined) {
            this.bookkeepingData.push(verification);
        } else {
            this.bookkeepingData = this.bookkeepingData
                .map(d => {
                    if (d.id === verification.id)
                        return verification;
                    return d;
                });
        }

        if (groupedVerifications.length > 0) {
            groupedVerifications = groupedVerifications
                .map(v => verificationNameToNumber(v));
            groupedVerifications.push(verification.id);
            setGroupedVerifications(this.bookkeepingData, groupedVerifications);
        }

        this.closeModal();
        this.handleBookkeeping();
        return 0;
    }

    editVerification = (verification) => {
        if (verification === undefined) {
            document.getElementById("modal-header-title").innerHTML = "Add manual verification";
        } else {
            document.getElementById("modal-header-title").innerHTML = "Edit verification " + verification.id;
        }

        this.modalRowNumber = 0;
        this.modalGroupedVerificationsNumber = 0;
        let desc = "";
        if (verification && verification.description)
            desc = verification.description;
        else if (verification && verification.notes)
            desc = verification.notes;
        else if (verification && verification.message)
            desc = verification.message;

        let pre = verification ? "<pre>\n" + JSON.stringify(verification, null, 2) + "\n</pre>" : "";
        document.getElementById("modal-body").innerHTML = pre +
            "<div id='modal-grid' class='modal-grid'>" +
            "  <div class='modal-grid-addrow'>&nbsp;</div>" +
            "  <div class='modal-grid-label'><label for='descinput'>Description:</label></div>" +
            "  <div class='modal-grid-desc'> <input type='text' id='descinput' name='desc' value='" + desc + "'></div>" +
            "  <div id='modal-grid-grouprow' class='modal-grid-grouprow'>" +
            "    <button id='groupbutton' title='Group verifications'>Group verifications &#9660;</button>" +
            "    <fieldset id='grouped-verifications' style='display: none'>" +
            "      <legend id='grouped-verifications-legend'>Group verifications &#9650;</legend>" +
            "      <p>Verifications belonging together can be grouped below.</p>" +
            "      <div id='grouped-verifications-modal-grid' class='grouped-verifications-modal-grid'>" +
            "      </div>" +
            "    </fieldset>" +
            "  </div>" +
            "  <div id='modal-grid-saverow' class='modal-grid-saverow'><button id='savebutton'>Save</button></div>" +
            "</div>";

        let showGroupVerifications = () => {
            document.getElementById("grouped-verifications").style.display = "block";
            document.getElementById("groupbutton").style.display = "none";
        }
        document.getElementById("grouped-verifications-legend").onclick = () => {
            document.getElementById("grouped-verifications").style.display = "none";
            document.getElementById("groupbutton").style.display = "block";
        }
        document.getElementById("groupbutton").onclick = () => {
            showGroupVerifications();
        };

        if (verification === undefined) {
            verification = {
                "id": "M" + getNextManualId(this.bookkeepingData),
                "date": new Date().toISOString().slice(0, 10),
                "description": "",
            };
            console.log(verification.id)
        }

        if (!verification.balance) {
            this.addBalanceRow(this.modalRowNumber++, Math.abs(verification.amount), verification.date);
        } else {
            verification.balance.forEach(b => {
                this.addBalanceRow(this.modalRowNumber++, b.amount, b.date, b.debit, b.credit);
            });
        }
        if (!verification.grouped_verifications) {
            this.addGroupedVerificationsRow(this.modalGroupedVerificationsNumber++);
        } else {
            verification.grouped_verifications.forEach(b => {
                this.addGroupedVerificationsRow(this.modalGroupedVerificationsNumber++, b.verification);
            });
            showGroupVerifications();
        }
        let modal = document.getElementById("modal");
        modal.style.display = "block";

        let saveAndRemoveListener = () => {
            this.saveVerification(verification);
            document.body.removeEventListener("keydown", saveFunc);
        };
        let saveFunc = e => {
            if (e.key === "Enter" &&
                document.activeElement !== document.getElementById("addrowbtn") &&
                document.activeElement !== document.getElementById("addgroupedrowbtn") &&
                document.activeElement !== document.getElementById("groupbutton") &&
                modal.style.display !== "none"
            ) {
                saveAndRemoveListener();
            }
        }

        document.getElementById("descinput").focus();
        document.getElementById("savebutton").onclick = () => {
            saveAndRemoveListener();
        }
        document.body.addEventListener('keydown', saveFunc);
    }

    validateNumber = (id) => {
        let input = document.getElementById(id);
        if (/^ *([0-9]+)(.[0-9][0-9]?)? *$/.test(input.value)) {
            input.className = "";
            return true;
        }
        input.className = "input-error";
        return false;
    }
    validateAccount = (id) => {
        let input = document.getElementById(id);
        if (/^ *([0-9]{4}).*$/.test(input.value)) {
            input.className = "";
            return true;
        }
        input.className = "input-error";
        return false;
    }
    validateDate = (id) => {
        let input = document.getElementById(id);
        if (/^ *(19[0-9]{2}|20[0-9]{2})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) *$/.test(input.value)) {
            input.className = "";
            return true;
        }
        input.className = "input-error";
        return false;
    }
    validateVerification = (id) => {
        let input = document.getElementById(id);
        let processedVerifications = getProcessedVerifications(this.bookkeepingData);

        if (processedVerifications.includes(input.value) ||
            processedVerifications.map(pv => verificationNameToNumber(pv)).includes(input.value)
        ) {
            input.className = "";
            return true;
        }
        input.className = "input-error";
        return false;
    }

    addGroupedVerificationsRow = (rownum, verification = "") => {

        let btn = document.getElementById("addgroupedrowbtn");
        if (btn) {
            btn.remove();
        }
        function insert(node) {
            document.getElementById("grouped-verifications-modal-grid").appendChild(node);
        }

        const dl = document.createElement("datalist");
        dl.id = "verifications";
        document.body.appendChild(dl);

        let verificationName = "";
        getProcessedVerifications(this.bookkeepingData).forEach(desc => {
            const o = document.createElement("option");
            o.value = desc;
            dl.appendChild(o);

            if (desc.startsWith(verification + " - "))
                verificationName = desc;
        });


        btn = document.createElement("button");
        btn.id = "addgroupedrowbtn";
        btn.title = "Add row";
        btn.innerHTML = "➕";
        btn.onclick = () => this.addGroupedVerificationsRow(this.modalGroupedVerificationsNumber++);

        let div;
        div = document.createElement("div");
        div.className = "grouped-verifications-modal-grid-addrow";
        div.appendChild(btn);
        insert(div);

        div = document.createElement("div");
        div.className = "modalgrouped-verifications-modal-grid-ver";
        div.innerHTML = "<input list='verifications' id='groupedverification" + rownum + "' value='" + verificationName + "'/>";
        insert(div);


        document.getElementById("groupedverification" + rownum).onblur = () => {
            this.validateVerification("groupedverification" + rownum);
        }
    }

    addBalanceRow = (rownum, amount, date, debit = "", credit = "") => {
        let d = "", c = "";

        if (debit !== "")
            d = accountPlanNumberToName(debit, this.accountPlanData);
        if (credit !== "")
            c = accountPlanNumberToName(credit, this.accountPlanData);

        let btn = document.getElementById("addrowbtn");
        if (btn) {
            btn.remove();
        }
        function insert(node) {
            document.getElementById("modal-grid")
                .insertBefore(node, document.getElementById("modal-grid-grouprow"));
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
        div.innerHTML = "<input type='number' id='amountinput" + rownum + "' name='amount' value='" + amount + "'>";
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


        document.getElementById("amountinput" + rownum).onblur = () => {
            this.validateNumber("amountinput" + rownum);
        };
        document.getElementById("credit-choice" + rownum).onblur = () => {
            this.validateAccount("credit-choice" + rownum);
        }
        document.getElementById("debit-choice" + rownum).onblur = () => {
            this.validateAccount("debit-choice" + rownum);
        }
        document.getElementById("dateinput" + rownum).onblur = () => {
            this.validateDate("dateinput" + rownum);
        }
    }

    handleBookkeeping = () => {
        let gui = this;
        const table = document.getElementById("bookkeeping");
        table.innerHTML = "";
        const th = document.createElement("tr");
        th.innerHTML = "<th>Id</th><th>Date</th><th>Amount</th><th>Message</th><th>Text</th><th>Notes</th><th>Edit</th>";
        table.appendChild(th);

        this.bookkeepingData.forEach(function(verification) {
            const tr = document.createElement("tr");
            tr.onclick = () => {
                gui.editVerification(verification);
            }
            let td = document.createElement("td");
            td.innerHTML = verification.id;
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = verification.date;
            tr.appendChild(td);

            tr.appendChild(gui.createNumberCell(verification.amount));

            td = document.createElement("td");
            td.innerHTML = verification.message || "&nbsp;";
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = verification.name || "&nbsp";
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = (verification.description !== undefined ? verification.description : verification.notes);
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = (verification.description !== undefined ? "✅" : "❌");
            tr.appendChild(td);

            table.appendChild(tr);
        });
    }

    handleAccountPlan = () => {
        let gui = this;
        const table = document.getElementById("accountplan");
        table.innerHTML = "";
        const th = document.createElement("tr");
        th.innerHTML = "<th>Account Number</th><th>Name</th><th>Account Type</th>";
        table.appendChild(th);

        const dl = document.createElement("datalist");
        dl.id = "account-plan";
        document.body.appendChild(dl);

        gui.accountPlanData.forEach(plan => {
            const tr = document.createElement("tr");
            tr.innerHTML =
                "<td>" + plan.account_number + "</td>" +
                "<td>" + plan.name + "</td>" +
                "<td>" + plan.account_type + "</td>" +
                "";
            table.appendChild(tr);

            const o = document.createElement("option");
            o.value = accountPlanNumberToName(plan.account_number, gui.accountPlanData);
            dl.appendChild(o);
        });
    }

    handleLedger = (data) => {
        const table = document.getElementById("ledger");
        table.innerHTML = "";
        const th = document.createElement("tr");
        th.innerHTML = "<th>Date</th><th>Account</th><th>Debet</th><th>Credit</th>";
        table.appendChild(th);

        data.forEach(verification => {
            const tr = document.createElement("tr");

            let td = document.createElement("td");
            td.innerHTML = verification.date;
            tr.appendChild(td);

            td = document.createElement("td");
            td.className = "linkcell";
            td.innerHTML = "V" + verification.id + " - " + verification.description;
            td.onclick = () => {
                this.handleVerification(verifications(this.bookkeepingData, [verification.id]));
                this.switchtab("verification");
            };
            tr.appendChild(td);

            tr.appendChild(this.createNumberCell(verification.debit, false));
            tr.appendChild(this.createNumberCell(verification.credit, false));

            table.appendChild(tr);
        });
    }

    handleVerification = (data) => {
        const table = document.getElementById("verification");
        table.innerHTML = "";
        table.className = "norowalternate";
        const th = document.createElement("tr");
        th.innerHTML = "<th>Date</th><th>Account</th><th>Debet</th><th>Credit</th>";
        table.appendChild(th);

        data.forEach(verification => {
            let tr = document.createElement("tr");
            tr.className = "mainrow";
            let td = document.createElement("td");
            td.innerHTML = verification.date;
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = "V" + verification.id + " - " + verification.description;
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerHTML = "&nbsp;";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = "&nbsp;";
            tr.appendChild(td);

            table.appendChild(tr);

            verification.balance.forEach(b => {
                tr = document.createElement("tr");
                tr.className = "subrow";
                td = document.createElement("td");
                td.innerHTML = "&nbsp;";
                tr.appendChild(td);

                let accountName = accountPlanNumberToName(b.debit, this.accountPlanData);
                td = document.createElement("td");
                td.className = "linkcell";
                td.innerHTML = accountName;
                td.onclick = () => {
                    this.handleLedger(eventsForAccount(this.bookkeepingData, b.debit));
                    this.switchtab("ledger");
                };
                tr.appendChild(td);

                tr.appendChild(this.createNumberCell(b.amount));
                td = document.createElement("td");
                td.innerHTML = "&nbsp;";
                tr.appendChild(td);

                table.appendChild(tr);


                tr = document.createElement("tr");
                tr.className = "subrow";
                td = document.createElement("td");
                td.innerHTML = "&nbsp;";
                tr.appendChild(td);

                accountName = accountPlanNumberToName(b.credit, this.accountPlanData);
                td = document.createElement("td");
                td.className = "linkcell";
                td.innerHTML = accountName;
                td.onclick = () => {
                    this.handleLedger(eventsForAccount(this.bookkeepingData, b.credit));
                    this.switchtab("ledger");
                };
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = "&nbsp;";
                tr.appendChild(td);
                tr.appendChild(this.createNumberCell(b.amount));

                table.appendChild(tr);
            });
        });
    }

    handleAccountList = () => {
        const table = document.getElementById("accountlist");
        table.innerHTML = "";
        const th = document.createElement("tr");
        th.innerHTML = "<th>Account</th><th>Ingoing Balance</th><th>Debet</th><th>Credit</th><th>Outgoing Balance</th>";
        table.appendChild(th);

        accountList(this.bookkeepingData, this.yearData).forEach(verification => {
            const tr = document.createElement("tr");
            let accountName = accountPlanNumberToName(verification.account, this.accountPlanData);

            let td = document.createElement("td");
            td.className = "linkcell";
            td.innerHTML = accountName;
            td.onclick = () => {
                this.handleLedger(eventsForAccount(this.bookkeepingData, verification.account));
                this.switchtab("ledger");
            };
            tr.appendChild(td);

            let ingoingBalance = this.yearData.ingoing_balance
                .find(i => i.account === verification.account)
                ?.amount || 0;

            let outgoingBalance = ingoingBalance + verification.debit - verification.credit;

            tr.appendChild(this.createNumberCell(ingoingBalance));
            tr.appendChild(this.createNumberCell(verification.debit));
            tr.appendChild(this.createNumberCell(verification.credit));
            tr.appendChild(this.createNumberCell(outgoingBalance));

            table.appendChild(tr);
        });
    }

    saveToFile = () => {
        let data = this.bookkeepingData
            .filter(d => d.description && d.balance)
            .map(d => {
                return {
                    "id": d.id,
                    "description": d.description,
                    "balance": d.balance
                };
            });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob(
            [JSON.stringify(data)],
            { type:"text/json"}
        ));
        a.download = "accounting.json";
        a.click();
        a.remove();
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
    fetch("bookkeeping.json").then(x => x.text()),
    fetch("year.json").then(x => x.text()),
]).then(([accountPlan, bookkeeping, year]) => {
    let gui = new Gui(JSON.parse(bookkeeping), JSON.parse(accountPlan), JSON.parse(year));
    gui.switchtab("bookkeeping");

    Array.from(document.getElementsByClassName("tablinks")).forEach(t => {
        t.onclick = () => gui.switchtab(t.dataset.tab);
    });
    document.getElementById("savebtn").onclick = () => gui.saveToFile();
    document.getElementById("addManualVerification").onclick = () => gui.editVerification();
});

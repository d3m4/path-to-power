import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    Alert,
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    FormGroup,
    Input,
    Button,
} from 'reactstrap';

// components
import ItemSlot from '../item/slot';
import DropSlot from './drop';
import SaleItem from './saleitem';

// actions
import {shopClose} from './actions';

class Shop extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            itemType: '',
            itemSubType: '',
            sortBy: '',
        };
    }

    renderNotification() {
        if (!this.props.shop || !this.props.shop.notification) {
            return null;
        }

        const {type, message} = this.props.shop.notification;
        let color = 'danger';

        switch (type) {
            case 'success':
                color = 'success';
                break;

            case 'info':
                color = 'info';
                break;
        }

        return <Alert color={color}>
            {message}
        </Alert>;
    }

    renderItemTypes() {
        const {shop, itemList} = this.props;
        let types = [];
        let options = [];

        shop.sell.list.forEach((shopItem) => {
            const item = itemList[shopItem.id];

            if (item && !types.includes(item.type)) {
                types.push(item.type);
                options.push(<option key={item.type} value={item.type}>{item.type}</option>);
            }
        });

        return options;
    }

    renderItemSubTypes() {
        const {itemType} = this.state;

        if (itemType === '') {
            return null;
        }

        const {shop, itemList} = this.props;
        let types = [];
        let options = [];

        shop.sell.list.forEach((shopItem) => {
            const item = itemList[shopItem.id];

            if (item && !types.includes(item.subtype) && item.type === itemType) {
                types.push(item.subtype);
                options.push(<option key={item.subtype} value={item.subtype}>{item.subtype}</option>);
            }
        });

        return options;
    }

    renderShopList() {
        const {shop} = this.props;
        let {itemType, itemSubType, sortBy} = this.state;

        if (!shop) {
            return null;
        }

        if (shop && !shop.sell.enabled) {
            return <p>No selling anything.</p>;
        }

        let {list} = shop.sell;
        let sortedItemList = [...list];

        if (sortBy !== '') {
            sortBy = sortBy.split(':');

            sortedItemList = sortedItemList.sort((a, b) => {
                if (a[sortBy[0]] < b[sortBy[0]]) {
                    return sortBy[1] === 'asc' ? -1 : 1;
                }

                if (a[sortBy[0]] > b[sortBy[0]]) {
                    return sortBy[1] === 'asc' ? 1 : -1;
                }

                return 0;
            });
        }

        return sortedItemList.map((shopItem, index) => {
            if (itemType !== '') {
                const item = this.props.itemList[shopItem.id];

                // if the item does not exist
                if (!item) {
                    return null;
                }

                // if the item type does not match
                if (item.type !== itemType) {
                    return null;
                }

                // if the item sub type is defined and does not match
                if (itemSubType !== '' && item.subtype !== itemSubType) {
                    return null;
                }
            }

            return <SaleItem
                key={index}
                shopFingerprint={shop.fingerprint}
                shopItem={shopItem} />;
        });
    }

    render() {
        const {shop, inventorySize} = this.props;
        const slots = Array.from(Array(inventorySize).keys());

        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.shopClose} size="lg">
                <ModalHeader toggle={this.props.shopClose}>Shop</ModalHeader>
                <ModalBody>
                    {this.renderNotification()}
                    <Row>
                        {
                            shop && shop.sell.enabled &&
                            <React.Fragment>
                                <Col xs="12">
                                    <strong>Shop Filters:</strong>
                                </Col>
                                <Col xs="3">
                                    <FormGroup>
                                        <Input
                                            type="select"
                                            name="type"
                                            value={this.state.itemType}
                                            onChange={(e) => this.setState({itemType: e.target.value, itemSubType: ''})}
                                        >
                                            <option value="" defaultValue hidden>Item Type</option>
                                            {this.renderItemTypes()}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col xs="3">
                                    <FormGroup>
                                        <Input
                                            type="select"
                                            name="subtype"
                                            value={this.state.itemSubType}
                                            onChange={(e) => this.setState({itemSubType: e.target.value})}
                                        >
                                            <option value="" defaultValue hidden>Item Sub-Type</option>
                                            {this.renderItemSubTypes()}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col xs="3">
                                    <FormGroup>
                                        <Input
                                            type="select"
                                            name="sortBy"
                                            value={this.state.sortBy}
                                            onChange={(e) => this.setState({sortBy: e.target.value})}
                                        >
                                            <option value="" defaultValue hidden>Sort By</option>
                                            <optgroup label="Name">
                                                <option value="name:asc">Ascending</option>
                                                <option value="name:desc">Descending</option>
                                            </optgroup>
                                            <optgroup label="Price">
                                                <option value="price:asc">Ascending</option>
                                                <option value="price:desc">Descending</option>
                                            </optgroup>
                                            <optgroup label="EXP Needed">
                                                <option value="expRequired:asc">Ascending</option>
                                                <option value="expRequired:desc">Descending</option>
                                            </optgroup>
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col xs="3">
                                    <Button
                                        onClick={() => this.setState({
                                            itemType: '',
                                            itemSubType: '',
                                            sortBy: '',
                                        })}
                                        color="warning"
                                    >
                                        Reset
                                    </Button>
                                </Col>
                                <Col xs="12">
                                    <hr style={{margin: '0px 0px 12px'}}/>
                                </Col>
                            </React.Fragment>
                        }
                        <Col xs="6">
                            <div id="shop">
                                {
                                    this.renderShopList()
                                }
                            </div>
                        </Col>
                        <Col xs="6">
                            <div id="inventory">
                                {
                                    slots.length && slots.map((inventorySlot, index) => {
                                        return <ItemSlot key={index} inventorySlot={'inv-' + inventorySlot} />;
                                    })
                                }
                                <DropSlot />
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        shopClose,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        itemList: state.game.items,
        shop: state.shop,
        isOpen: state.shop ? state.shop.open : false,
        inventorySize: state.character.selected ? state.character.selected.stats.inventorySize : 0,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Shop);
